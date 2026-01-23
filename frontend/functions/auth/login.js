export function onRequest(context) {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  const state = crypto.randomUUID();
  url.searchParams.set('client_id', context.env.GOOGLE_CLIENT_ID);
  url.searchParams.set('redirect_uri', context.env.GOOGLE_REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('state', state);


  const isLocalhost = new URL(context.request.url).hostname === 'localhost';

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      'Set-Cookie': `oauth_state=${state}; Path=/; Max-Age=600; ${isLocalhost ? '' : 'Secure; '}HttpOnly; SameSite=Lax`
    }
  });
}
