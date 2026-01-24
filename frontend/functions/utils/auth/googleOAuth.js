export async function verifyIdToken(idToken, clientId) {
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

export function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
