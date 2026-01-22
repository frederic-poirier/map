
import { signJwt } from "../../jwt";

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const name = parts[0]?.trim();
    const value = parts.slice(1).join("=").trim();
    if (name) cookies[name] = decodeURIComponent(value || "");
  });
  return cookies;
}

function log(message, data = {}) {
  console.log(`[AUTH] ${message}`, JSON.stringify(data));
}

export async function onRequest({ request, env }) {
  const startTime = Date.now();
  
  try {
    log("Starting callback", {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
    });

    const missingKeys = [
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "GOOGLE_REDIRECT_URI",
      "JWT_SECRET",
      "WHITELIST_EMAILS",
      "FRONTEND_ORIGIN",
    ];

    const missing = missingKeys.filter((key) => {
      const has = !!env[key];
      log(`Env ${key}:`, { value: has ? "SET" : "MISSING", length: env[key]?.length });
      return !has;
    });

    if (missing.length > 0) {
      return new Response(`Missing env vars: ${missing.join(", ")}`, { status: 500 });
    }

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    log("Query params", { code: !!code, state });

    if (!code) return new Response("Missing code", { status: 400 });

    const cookies = parseCookies(request.headers.get("cookie") || "");
    log("Cookies", { oauth_state: cookies.oauth_state, has_auth: !!cookies.auth_token });

    if (!state || !cookies.oauth_state) {
      log("State check failed", { state, cookieState: cookies.oauth_state });
      return new Response("Invalid state - no state or cookie", { status: 400 });
    }

    if (state !== cookies.oauth_state) {
      log("State mismatch", { state, cookieState: cookies.oauth_state });
      return new Response("Invalid state", { status: 400 });
    }

    log("Exchanging code for token...");
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    log("Token response", { 
      ok: tokenRes.ok, 
      error: tokenData.error,
      has_id_token: !!tokenData.id_token,
      token_type: tokenData.token_type,
    });

    if (tokenData.error) {
      log("Google token error", tokenData);
      return new Response(`Google error: ${tokenData.error_description || tokenData.error}`, { status: 400 });
    }

    if (!tokenData.id_token) {
      log("No id_token in response", tokenData);
      return new Response("No id_token from Google", { status: 400 });
    }

    const idTokenParts = tokenData.id_token.split(".");
    log("ID Token parts", { parts: idTokenParts.length });

    if (idTokenParts.length !== 3) {
      log("Invalid id_token format", tokenData.id_token);
      return new Response("Invalid id_token format", { status: 400 });
    }

    const payloadB64 = idTokenParts[1];
    const payload = JSON.parse(atob(payloadB64));

    const email = payload.email;
    const whitelist = env.WHITELIST_EMAILS.split(",").map((e) => e.trim());

    log("Checking whitelist", { 
      email, 
      whitelist,
      inWhitelist: whitelist.includes(email),
    });

    if (!whitelist.includes(email)) {
      return new Response("Forbidden", { status: 403 });
    }

    log("Signing JWT...", { email });
    const jwt = await signJwt({ sub: email, email }, env.JWT_SECRET);
    log("JWT signed", { jwtLength: jwt.length });

    const refreshToken = crypto.randomUUID();

    const headers = new Headers();
    headers.set("Location", `${env.FRONTEND_ORIGIN}/callback`);
    headers.append("Set-Cookie", `auth_token=${jwt}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900`);
    headers.append("Set-Cookie", `refresh_token=${refreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
    headers.append("Set-Cookie", `oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);

    log("Redirecting", { location: `${env.FRONTEND_ORIGIN}/callback`, duration: Date.now() - startTime });

    return new Response(null, {
      status: 302,
      headers,
    });
  } catch (error) {
    log("ERROR", { 
      message: error.message, 
      stack: error.stack,
      duration: Date.now() - startTime 
    });
    return new Response(`Internal error: ${error.message}`, { status: 500 });
  }
}
