
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

function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return atob(str);
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
    log("Cookies", { has_oauth_state: !!cookies.oauth_state, has_auth: !!cookies.auth_token });

    if (!state || !cookies.oauth_state) {
      log("State check failed", { hasState: !!state, hasCookieState: !!cookies.oauth_state });
      return new Response("Invalid state - no state or cookie", { status: 400 });
    }

    if (state !== cookies.oauth_state) {
      log("State mismatch");
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
    let payload;
    try {
      payload = JSON.parse(base64UrlDecode(payloadB64));
    } catch (e) {
      log("Failed to decode id_token payload", { error: e.message });
      return new Response("Invalid id_token payload", { status: 400 });
    }

    // Vérification cryptographique du id_token
    if (payload.aud !== env.GOOGLE_CLIENT_ID) {
      log("Invalid token audience", { aud: payload.aud, expected: env.GOOGLE_CLIENT_ID });
      return new Response("Invalid token audience", { status: 400 });
    }

    if (payload.iss !== "https://accounts.google.com" && payload.iss !== "accounts.google.com") {
      log("Invalid token issuer", { iss: payload.iss });
      return new Response("Invalid token issuer", { status: 400 });
    }

    if (payload.exp * 1000 < Date.now()) {
      log("Token expired", { exp: payload.exp, now: Math.floor(Date.now() / 1000) });
      return new Response("Token expired", { status: 400 });
    }

    const email = payload.email;
    if (!email) {
      log("No email in token payload");
      return new Response("No email in token", { status: 400 });
    }

    const whitelist = env.WHITELIST_EMAILS.split(",").map((e) => e.trim());

    log("Checking whitelist", { 
      email, 
      inWhitelist: whitelist.includes(email),
    });

    if (!whitelist.includes(email)) {
      return new Response("Forbidden", { status: 403 });
    }

    // Upsert user in D1
    log("Upserting user in D1...", { email });
    const name = payload.name || null;
    const picture = payload.picture || null;

    await env.DB.prepare(`
      INSERT INTO users (email, name, picture, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(email) DO UPDATE SET
        name = excluded.name,
        picture = excluded.picture,
        updated_at = datetime('now')
    `).bind(email, name, picture).run();

    // Get user ID
    const userResult = await env.DB.prepare(
      "SELECT id FROM users WHERE email = ?"
    ).bind(email).first();

    if (!userResult) {
      log("Failed to get user ID");
      return new Response("Failed to create user", { status: 500 });
    }

    const userId = userResult.id;
    log("User upserted", { userId });

    // Generate and store refresh token (7 days expiry)
    const refreshToken = crypto.randomUUID();
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await env.DB.prepare(`
      INSERT INTO refresh_tokens (token, user_id, expires_at)
      VALUES (?, ?, ?)
    `).bind(refreshToken, userId, refreshExpiresAt).run();

    log("Refresh token stored", { expiresAt: refreshExpiresAt });

    log("Signing JWT...", { email });
    const jwt = await signJwt({ sub: email, email, userId }, env.JWT_SECRET);
    log("JWT signed", { jwtLength: jwt.length });

    const headers = new Headers();
    headers.set("Location", `${env.FRONTEND_ORIGIN}/callback`);
    headers.append("Set-Cookie", `auth_token=${jwt}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=900`);
    headers.append("Set-Cookie", `refresh_token=${refreshToken}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=604800`);
    headers.append("Set-Cookie", `oauth_state=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`);

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
