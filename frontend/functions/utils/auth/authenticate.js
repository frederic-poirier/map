
import { getCookie } from './cookies';
import { getSession, refreshSession } from '../db/sessionStore';
import { SESSION_COOKIE, SESSION_DURATION, REFRESH_THRESHOLD } from './constants';

export async function authenticateUser(request, env) {
  let refreshed = true;
  const sessionId = getCookie(request, SESSION_COOKIE);
  if (!sessionId) return null;

  const row = await getSession(sessionId, env);
  if (!row) return null;

  const now = Math.floor(Date.now() / 1000);
  const timeLeft = row.expires_at - now;

  refreshed = false
  let expiresAt = row.expires_at;

  if (timeLeft < REFRESH_THRESHOLD) {
    expiresAt = now + SESSION_DURATION;
    await refreshSession(sessionId, expiresAt, env);
  }

  return {
    sessionId,
    userId: row.user_id,
    email: row.email,
    name: row.name,
    expiresAt,
    refreshed
  };
}
