
import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import { signSession, verifySession } from "../lib/auth-utils.js";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { CLIENT_ID, CLIENT_SECRET, ALLOWED_EMAILS } from "../config";

const auth = new Hono();

function getOrigin(c) {
  const proto =
    c.req.header("x-forwarded-proto") ??
    new URL(c.req.url).protocol.replace(":", "");
  const host =
    c.req.header("x-forwarded-host") ??
    c.req.header("host");
  return `${proto}://${host}`;
}

/* ---------- LOGIN ---------- */
auth.get("/login", (c) => {
  const origin = getOrigin(c);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: `${origin}/auth/callback`,
    scope: "openid email profile",
    response_type: "code",
    prompt: "select_account",
  });

  return c.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
});

/* ---------- CALLBACK ---------- */
auth.get("/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) return c.text("Missing code", 400);

  const origin = getOrigin(c);

  const tokenResponse = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: `${origin}/auth/callback`,
        grant_type: "authorization_code",
      }),
    }
  );

  const tokenData = await tokenResponse.json();

  const userResp = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    }
  );

  const userData = await userResp.json();

  if (!ALLOWED_EMAILS.includes(userData.email)) {
    return c.text("Unauthorized", 403);
  }

  const sessionData = await signSession(userData.email);

  setCookie(c, "auth_session", sessionData, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return c.redirect(origin);
});

/* ---------- API ---------- */
auth.get("/me", async (c) => {
  const session = getCookie(c, "auth_session");
  const email = await verifySession(session);
  if (!email) return c.json({ authenticated: false }, 401);

  let user =
    db.select().from(users).where(eq(users.email, email)).get() ??
    db.insert(users)
      .values({ email, username: email.split("@")[0] })
      .returning()
      .get();

  return c.json({ authenticated: true, email: user.email });
});

auth.get("/refresh", async (c) => {
  const session = getCookie(c, "auth_session");
  const email = await verifySession(session);
  if (!email) return c.json({ error: "Invalid session" }, 401);

  const newSession = await signSession(email);

  setCookie(c, "auth_session", newSession, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return c.json({ authenticated: true });
});

auth.get("/logout", (c) => {
  deleteCookie(c, "auth_session", { path: "/" });
  return c.redirect(getOrigin(c));
});

export { auth };
