import { authenticateUser } from './authenticate';
import { buildSessionCookie } from './cookies';

export async function requireAuth(request, env) {
  const auth = await authenticateUser(request, env);

  if (!auth) {
    return new Response(
      JSON.stringify({ error: 'Non autorisé' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'private, no-cache'
  });

  if (auth.refreshed) {
    headers.append('Set-Cookie', buildSessionCookie(auth.sessionId));
  }

  return { auth, headers };
}

