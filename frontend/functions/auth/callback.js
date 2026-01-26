import { buildSessionCookie, clearOAuthStateCookie, getCookie } from "../utils/auth/cookies";
import { createUserFromGoogle, findUserByGoogleSub } from "../utils/db/userStore";
import { createSession } from "../utils/db/sessionStore";
import { verifyIdToken, timingSafeEqual } from '../utils/auth/googleOAuth';
import { SESSION_DURATION } from "../utils/auth/constants";

export async function onRequest({ request, env }) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const stateCookie = getCookie(request, 'oauth_state');


    if (!code || !state || !stateCookie) return new Response('Requête invalide', { status: 400 });
    if (!timingSafeEqual(state, stateCookie)) return new Response('État invalide', { status: 400 });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
        code
      })
    });

    if (!tokenRes.ok) return new Response('Authentification échouée', { status: 500 });

    const { id_token } = await tokenRes.json();
    const payload = await verifyIdToken(id_token, env.GOOGLE_CLIENT_ID);
    const { sub, email, name } = payload;


    const whitelistedEmails = env.WHITELIST_EMAILS
      .split(',')
      .map(e => e.trim().toLowerCase());

    if (!whitelistedEmails.includes(email.toLowerCase())) {
      return new Response(
        'Accès refusé. Votre adresse courriel n\'est pas autorisée.',
        { status: 403 }
      );
    }


    let user = await findUserByGoogleSub(sub, env);
    if (!user) user = await createUserFromGoogle({ sub, email, name }, env);
    const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION;
    const sessionId = await createSession(user.id, expiresAt,env);

    const headers = new Headers();
    headers.set('Location', '/');
    headers.append('Set-Cookie', clearOAuthStateCookie());
    headers.append('Set-Cookie', buildSessionCookie(sessionId, request));


    return new Response(null, {
      status: 302,
      headers
    });

  } catch (error) {
    return new Response(`Authentification échouée`, { status: 500 });
  }
}
