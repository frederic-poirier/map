
import { verifyJwt } from "../jwt";

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
  console.log(`[ME] ${message}`, JSON.stringify(data));
}

export async function onRequest({ request, env }) {
  try {
    log("Checking auth", { 
      hasSecret: !!env.JWT_SECRET,
      cookieLength: request.headers.get("cookie")?.length || 0,
    });

    if (!env.JWT_SECRET) {
      return new Response("Missing JWT_SECRET", { status: 500 });
    }

    const cookies = parseCookies(request.headers.get("cookie") || "");
    const token = cookies.auth_token;

    log("Token", { hasToken: !!token, tokenPreview: token?.substring(0, 20) });

    if (!token) {
      return new Response(
        JSON.stringify({ authenticated: false }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const payload = await verifyJwt(token, env.JWT_SECRET);
    const expiresAt = payload.exp * 1000;

    log("Success", { 
      email: payload.email, 
      expiresAt,
      expired: expiresAt < Date.now(),
    });

    return Response.json({
      authenticated: true,
      userId: payload.sub,
      email: payload.email,
      expiresAt,
    });
  } catch (error) {
    log("Error", { message: error.message, name: error.name });
    return new Response(
      JSON.stringify({ authenticated: false, error: error.message }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
