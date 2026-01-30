import { SESSION_DURATION, SESSION_COOKIE } from "./constants";


function isProd(request) {
  return request.url.startsWith('https://');
}

function cookieDomain(request) {
  const host = new URL(request.url).hostname;
  if (host.endsWith('.frederic.dog')) return '; Domain=.frederic.dog';
  return ''; // localhost
}

export function buildOAuthStateCookie(state, request) {
  const secure = isProd(request) ? '; Secure' : '';
  return `oauth_state=${state}; Path=/; Max-Age=600; HttpOnly; SameSite=Lax${secure}`;
}

export function clearOAuthStateCookie() {
  return 'oauth_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax';
}



export function buildSessionCookie(
  value,
  request,
  maxAge = SESSION_DURATION
) {
  const prod = isProd(request);

  const secure = prod ? '; Secure' : '';
  const sameSite = prod ? 'None' : 'Lax';
  const domain = cookieDomain(request);

  return (
    `${SESSION_COOKIE}=${encodeURIComponent(value)}` +
    `; Path=/` +
    `; Max-Age=${maxAge}` +
    `; HttpOnly` +
    `; SameSite=${sameSite}` +
    secure +
    domain
  );
}


export function clearSessionCookie(request) {
  const prod = isProd(request);
  const secure = prod ? '; Secure' : '';
  const domain = cookieDomain(request);
  const sameSite = prod ? 'None' : 'Lax';

  return (
    `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly` +
    `; SameSite=${sameSite}` +
    secure +
    domain
  );
}


export function getCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie
    .split('; ')
    .find(c => c.startsWith(name + '='));

  return match ? decodeURIComponent(match.split('=')[1]) : null;
}
