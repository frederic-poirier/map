import { REFRESH_THRESHOLD, SESSION_COOKIE, SESSION_DURATION } from "./constants";
import { getCookie } from "./cookies";
import { signSession, verifySession } from "./sessionToken";

export function authenticateUser(request, env) {
  const raw = getCookie(request, SESSION_COOKIE);
  if (!raw) return null;

  const payload = verifySession(raw, env.SESSION_SECRET)
  if (!payload) return null;

  const now = Math.floor(Date.now() / 1000)
  if (payload.exp <= now) return null; // Expire

  let refreshed = false
  let newToken = null;

  if (payload - now < REFRESH_THRESHOLD) { // Sliding expriation
    refreshed = true;
    newToken = signSession(
      { ...payload, exp: now + SESSION_DURATION },
      env.SESSION_SECRET
    )
  }

  return {
    userId: payload.uid,
    email: payload.email,
    name: payload.name,
    expiresAt: payload.exp,
    refreshed,
    newToken
  };
}

