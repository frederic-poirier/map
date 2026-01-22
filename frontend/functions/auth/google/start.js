export async function onRequest({ env }) {
  const state = crypto.randomUUID();
  console.log("[START] Generating state", { state });

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  googleUrl.searchParams.set("redirect_uri", env.GOOGLE_REDIRECT_URI);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("state", state);

  console.log("[START] Redirect URI", { redirectUri: env.GOOGLE_REDIRECT_URI });
  console.log("[START] Full Google URL", googleUrl.toString());

  const headers = new Headers();
  headers.set("Location", googleUrl.toString());
  headers.set("Set-Cookie", `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`);

  return new Response(null, {
    status: 302,
    headers,
  });
}
