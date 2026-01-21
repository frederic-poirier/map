
import { signJwt } from "../../jwt";
import { requireEnv } from "../../env";

export async function onRequest({ request, env }) {
  requireEnv(env, [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
    "JWT_SECRET",
    "WHITELIST_EMAILS",
    "FRONTEND_ORIGIN",
  ]);

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return new Response("Missing code", { status: 400 });

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
  const [, payloadB64] = tokenData.id_token.split(".");
  const payload = JSON.parse(atob(payloadB64));

  const email = payload.email;
  const whitelist = env.WHITELIST_EMAILS.split(",");

  if (!whitelist.includes(email)) {
    return new Response("Forbidden", { status: 403 });
  }

  const jwt = await signJwt({ sub: email, email }, env.JWT_SECRET);

  return Response.redirect(
    `${env.FRONTEND_ORIGIN}/callback?token=${encodeURIComponent(jwt)}`,
    302
  );
}
