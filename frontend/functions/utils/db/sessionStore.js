
export async function getSession(sessionId, env) {
  const now = Math.floor(Date.now() / 1000);

  return env.DB
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
}

export async function refreshSession(sessionId, newExpiresAt, env) {
  await env.DB
    .prepare(`UPDATE sessions SET expires_at = ? WHERE id = ?`)
    .bind(newExpiresAt, sessionId)
    .run();
}

export async function createSession(userId, expiresAt, env) {
  const sessionId = crypto.randomUUID();

  await env.DB
    .prepare(
      `INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)`
    )
    .bind(sessionId, userId, expiresAt)
    .run();

  return sessionId;
}

export async function deleteSession(sessionId, env) {
  await env.DB
    .prepare(`DELETE FROM sessions WHERE id = ?`)
    .bind(sessionId)
    .run();
}
