export function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie
    .split("; ")
    .find(c => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

export async function getSession(sessionId, env) {
  if (!sessionId) return null;

  const now = Math.floor(Date.now() / 1000);
  const session = await env.DB
    .prepare(`
            SELECT
                s.id,
                s.user_id,
                s.expires_at,
                u.email,
                u.name
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ? AND s.expires_at > ?
        `)
    .bind(sessionId, now)
    .first();

  return session ? {
    sessionId: session.id,
    userId: session.user_id,
    email: session.email,
    name: session.name,
    expiresAt: session.expires_at
  } : null;
}

export async function authenticateUser(request, env) {
  const sessionId = getCookie(request, 'session');
  if (!sessionId) return null;

  const session = await getSession(sessionId, env);
  return session;
}

export async function requireAuth(request, env) {
  const user = await authenticateUser(request, env);

  if (!user) {
    return new Response(JSON.stringify({
      error: 'Non autorisé',
      message: 'Vous devez être connecté pour accéder à cette ressource'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return user;
}

export async function createSession(userId, env) {
  const sessionId = crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 jours

  await env.DB
    .prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(sessionId, userId, expiresAt)
    .run();

  return sessionId;
}

export async function deleteSession(sessionId, env) {
  if (!sessionId) return;

  await env.DB
    .prepare('DELETE FROM sessions WHERE id = ?')
    .bind(sessionId)
    .run();
}
