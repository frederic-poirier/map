import { SESSION_DURATION, SESSION_COOKIE } from "./constants";

function isSecureRequest(request) {
  return request.url.startsWith('https://')
}

export function buildOAuthStateCookie(state, request) {
  const secure = isSecureRequest(request) ? '; Secure' : '';

  return `oauth_state=${state}; Path=/; Max-Age=600; HttpOnly; SameSite=Lax${secure}`;
}

export function clearOAuthStateCookie() {
  return 'oauth_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax';
}

export function buildSessionCookie(sessionId, request, maxAge = SESSION_DURATION) {
  const secure = isSecureRequest(request) ? '; Secure' : '';

  return `${SESSION_COOKIE}=${sessionId}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}

export function getCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie
    .split('; ')
    .find(c => c.startsWith(name + '='));

  return match ? decodeURIComponent(match.split('=')[1]) : null;
}
