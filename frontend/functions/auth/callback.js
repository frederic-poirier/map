// functions/api/auth/callback.js

import { getCookie, createSession } from "../utils/auth";

async function verifyIdToken(idToken, clientId) {
  const [headerB64, payloadB64, signatureB64] = idToken.split('.');
  if (!headerB64 || !payloadB64 || !signatureB64) {
    throw new Error('Invalid token format');
  }

  const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));

  const jwksRes = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  const { keys } = await jwksRes.json();
  const key = keys.find(k => k.kid === header.kid);
  if (!key) throw new Error('Invalid key id');

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    key,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const enc = new TextEncoder();
  const data = enc.encode(`${headerB64}.${payloadB64}`);
  const signature = Uint8Array.from(
    atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
    c => c.charCodeAt(0)
  );

  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    signature,
    data
  );

  if (!valid) throw new Error('Invalid signature');

  const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

  if (payload.iss !== 'https://accounts.google.com' &&
    payload.iss !== 'accounts.google.com') {
    throw new Error('Invalid issuer');
  }
  if (payload.aud !== clientId) throw new Error('Invalid audience');
  if (payload.exp * 1000 < Date.now()) throw new Error('Token expired');

  return payload;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function onRequest({ request, env }) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const stateCookie = getCookie(request, 'oauth_state');


    // Valider le state (anti-CSRF)
    if (!code || !state || !stateCookie) {
      return new Response('Requête invalide', { status: 400 });
    }

    if (!timingSafeEqual(state, stateCookie)) {
      return new Response('État invalide', { status: 400 });
    }

    // Échanger le code contre des tokens
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

    if (!tokenRes.ok) {
      return new Response('Authentification échouée', { status: 500 });
    }

    const token = await tokenRes.json();
    const { id_token } = token;

    // Vérifier et décoder le ID token
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

    // Trouver ou créer l'utilisateur
    let user = await env.DB
      .prepare('SELECT id FROM users WHERE google_sub = ?')
      .bind(sub)
      .first();

    if (!user) {
      const res = await env.DB
        .prepare('INSERT INTO users (google_sub, email, name) VALUES (?, ?, ?)')
        .bind(sub, email, name)
        .run();
      user = { id: res.meta.last_row_id };
    }

    // Créer la session
    const sessionId = await createSession(user.id, env);


    const isLocalhost = new URL(request.url).hostname === 'localhost';

    const headers = new Headers();
    headers.set('Location', '/');

    // Suppression du cookie oauth_state
    headers.append(
      'Set-Cookie',
      `oauth_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
    );

    // Création du cookie de session
    headers.append(
      'Set-Cookie',
      `session=${sessionId}; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax${isLocalhost ? '' : '; Secure'}`
    );


    return new Response(null, {
      status: 302,
      headers
    });

  } catch (error) {
    return new Response(
      JSON.stringify({
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      }, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
