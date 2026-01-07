import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import { signSession, verifySession } from "../lib/auth-utils";
import {
    isProd,
    COOKIE_DOMAIN,
    CLIENT_ID,
    CLIENT_SECRET,
    FRONTEND_URL,
    REDIRECT_URI,
    ALLOWED_EMAILS,
} from "../config";

const auth = new Hono();

auth.get("/login", (c) => {
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: "openid email profile",
        access_type: "offline",
        prompt: "select_account",
        response_type: "code",
    });
    return c.redirect(
        `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    );
});

auth.get("/auth/callback", async (c) => {
    const code = c.req.query("code");
    if (!code) return c.text("Missing code", 400);

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: "authorization_code",
        }),
    });

    const tokenData = await tokenResponse.json();
    const userResp = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        }
    );
    const userData = await userResp.json();

    if (!ALLOWED_EMAILS.includes(userData.email)) {
        return c.text("Unauthorized", 403);
    }

    const sessionData = await signSession(userData.email);

    setCookie(c, "auth_session", sessionData, {
        httpOnly: true,
        secure: isProd,
        sameSite: "Lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return c.redirect(FRONTEND_URL);
});

auth.get("/me", async (c) => {
    const session = getCookie(c, "auth_session");
    const userEmail = await verifySession(session);

    if (!userEmail) return c.json({ authenticated: false }, 401);

    return c.json({ authenticated: true, email: userEmail });
});

auth.get("/logout", (c) => {
    deleteCookie(c, "auth_session", {
        domain: COOKIE_DOMAIN,
        path: "/",
    });
    return c.redirect(FRONTEND_URL);
});

export { auth };
