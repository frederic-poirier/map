
import { verifyJwt, signJwt, decodeJwt } from "../jwt";

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

    const cookies = parseCookies(request.headers.get("cookie") || "");
    const refreshToken = cookies.refresh_token;
    const currentToken = cookies.auth_token;

    log("Tokens", { hasRefresh: !!refreshToken, hasCurrent: !!currentToken });

    if (!refreshToken) {
      return new Response("No refresh token", { status: 401 });
    }

    if (!currentToken) {
      return new Response("No current token", { status: 401 });
    }

    let payload;
    
    // First try to verify the token (if still valid)
    try {
      log("Verifying current token...");
      payload = await verifyJwt(currentToken, env.JWT_SECRET);
      log("Token valid", { email: payload.email });
    } catch (verifyError) {
      // Token expired or invalid - try to decode it without verification
      // This allows refresh even if the access token has expired
      log("Token verification failed, attempting decode...", { error: verifyError.message });
      
      try {
        payload = decodeJwt(currentToken);
        log("Token decoded (expired but valid structure)", { email: payload.email });
        
        // Ensure we have the required fields
        if (!payload.sub || !payload.email) {
          throw new Error("Invalid token payload");
        }
      } catch (decodeError) {
        log("Token decode failed", { error: decodeError.message });
        return new Response("Invalid token", { status: 401 });
      }
    }

    const newJwt = await signJwt(
      { sub: payload.sub, email: payload.email },
      env.JWT_SECRET
    );

    log("New JWT signed", { length: newJwt.length });

    const response = new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });

    response.headers.append(
      "Set-Cookie",
      `auth_token=${newJwt}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900`
    );

    return response;
  } catch (error) {
    log("Error", { message: error.message });
    return new Response("Invalid token", { status: 401 });
  }
}
