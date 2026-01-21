
export async function onRequest({ env }) {
  const state = crypto.randomUUID();

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  googleUrl.searchParams.set("redirect_uri", env.GOOGLE_REDIRECT_URI);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("state", state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: googleUrl.toString(),
      "Set-Cookie": `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax`,
    },
  });
}
