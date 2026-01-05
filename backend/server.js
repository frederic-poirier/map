const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const FRONTEND_URL = "https://map.frederic.dog";
const JWT_SECRET = process.env.JWT_SECRET;
const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS?.split(",") || [];

async function signSession(email) {
  const payload = JSON.stringify({
    email,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  });
  const signature = await Bun.password.hash(payload + JWT_SECRET);
  return Buffer.from(`${payload}|${signature}`).toString("base64");
}

async function verifySession(cookieValue) {
  if (!cookieValue) return null;
  try {
    const decoded = Buffer.from(cookieValue, "base64").toString("utf-8");
    const [payloadStr, signature] = decoded.split("|");
    const isValid = await Bun.password.verify(
      payloadStr + JWT_SECRET,
      signature
    );
    if (!isValid) return null;
    const payload = JSON.parse(payloadStr);
    if (payload.exp < Date.now()) return null;
    return payload.email;
  } catch {
    return null;
  }
}

Bun.serve({
  port: 3000,
  fetch: async (req) => {
    const url = new URL(req.url);

    // 1. DÉTECTION DYNAMIQUE DE L'ORIGINE
    const requestOrigin = req.headers.get("Origin");
    const allowedOrigins = [FRONTEND_URL, "http://localhost:3001"];

    // On ne renvoie que l'origine qui a fait la requête si elle est autorisée
    const corsOrigin = allowedOrigins.includes(requestOrigin)
      ? requestOrigin
      : FRONTEND_URL;

    const corsHeaders = {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const cookieHeader = req.headers.get("Cookie") || "";
    const sessionCookie = cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith("auth_session="))
      ?.split("=")[1];
    const userEmail = await verifySession(sessionCookie);

    if (url.pathname === "/login") {
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: "openid email profile",
        access_type: "online",
        prompt: "select_account",
        response_type: "code",
      });
      return Response.redirect(
        `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
        302
      );
    }

    if (url.pathname === "/auth/callback") {
      const code = url.searchParams.get("code");
      if (!code) return new Response("Missing code", { status: 400 });

      const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
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
      const tokenData = await tokenResp.json();

      const userResp = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        }
      );
      const userData = await userResp.json();

      if (!ALLOWED_EMAILS.includes(userData.email)) {
        return new Response("Unauthorized", { status: 403 });
      }

      const sessionData = await signSession(userData.email);
      return new Response(null, {
        status: 302,
        headers: {
          Location: FRONTEND_URL,
          "Set-Cookie": `auth_session=${sessionData}; HttpOnly; Path=/; Domain=frederic.dog; Secure; SameSite=Lax; Max-Age=86400`,
        },
      });
    }

    if (url.pathname === "/me") {
      if (!userEmail)
        return Response.json(
          { authenticated: false },
          { status: 401, headers: corsHeaders }
        );
      return Response.json(
        { authenticated: true, email: userEmail },
        { headers: corsHeaders }
      );
    }

    if (url.pathname === "/logout") {
      return new Response(null, {
        headers: {
          "Set-Cookie": `auth_session=; HttpOnly; Path=/; Domain=frederic.dog; Max-Age=0`,
          Location: FRONTEND_URL,
          ...corsHeaders,
        },
        status: 302,
      });
    }

    return new Response("API Backend opérationnelle", { headers: corsHeaders });
  },
});

console.log("Server running on http://localhost:3000");
