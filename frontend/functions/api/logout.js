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
  console.log(`[LOGOUT] ${message}`, JSON.stringify(data));
}

export async function onRequest({ request, env }) {
  log("Logging out");

  // Revoke refresh token in D1 if present
  if (env.DB) {
    const cookies = parseCookies(request.headers.get("cookie") || "");
    const refreshToken = cookies.refresh_token;

    if (refreshToken) {
      try {
        await env.DB.prepare(`
          UPDATE refresh_tokens 
          SET revoked_at = datetime('now') 
          WHERE token = ?
        `).bind(refreshToken).run();
        log("Refresh token revoked in D1");
      } catch (error) {
        log("Failed to revoke refresh token", { error: error.message });
      }
    }
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.append("Set-Cookie", "auth_token=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0");
  headers.append("Set-Cookie", "refresh_token=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0");

  log("Cookies cleared");

  return new Response(JSON.stringify({ success: true }), {
    headers,
  });
}
