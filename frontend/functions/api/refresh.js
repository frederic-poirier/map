import { signJwt } from "../jwt";

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
  console.log(`[REFRESH] ${message}`, JSON.stringify(data));
}

export async function onRequest({ request, env }) {
  try {
    if (!env.JWT_SECRET) {
      return new Response("Missing JWT_SECRET", { status: 500 });
    }

    if (!env.DB) {
      return new Response("Missing DB binding", { status: 500 });
    }

    const cookies = parseCookies(request.headers.get("cookie") || "");
    const refreshToken = cookies.refresh_token;

    log("Refresh attempt", { hasRefreshToken: !!refreshToken });

    if (!refreshToken) {
      return new Response("No refresh token", { status: 401 });
    }

    // Validate refresh token from D1
    const tokenResult = await env.DB.prepare(`
      SELECT rt.id, rt.user_id, rt.expires_at, rt.revoked_at, u.email, u.name, u.picture
      FROM refresh_tokens rt
      JOIN users u ON u.id = rt.user_id
      WHERE rt.token = ?
    `).bind(refreshToken).first();

    if (!tokenResult) {
      log("Refresh token not found");
      return new Response("Invalid refresh token", { status: 401 });
    }

    if (tokenResult.revoked_at) {
      log("Refresh token revoked", { revokedAt: tokenResult.revoked_at });
      return new Response("Refresh token revoked", { status: 401 });
    }

    if (new Date(tokenResult.expires_at) < new Date()) {
      log("Refresh token expired", { expiresAt: tokenResult.expires_at });
      return new Response("Refresh token expired", { status: 401 });
    }

    log("Refresh token valid", { userId: tokenResult.user_id, email: tokenResult.email });

    // Generate new JWT
    const newJwt = await signJwt(
      { sub: tokenResult.email, email: tokenResult.email, userId: tokenResult.user_id },
      env.JWT_SECRET
    );

    log("New JWT signed", { length: newJwt.length });

    const response = new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });

    response.headers.append(
      "Set-Cookie",
      `auth_token=${newJwt}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=900`
    );

    return response;
  } catch (error) {
    log("Error", { message: error.message });
    return new Response("Internal error", { status: 500 });
  }
}
