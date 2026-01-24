
function base64urlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str) {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
}

async function hmacSign(data, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data)
  );

  return base64urlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );
}


export async function createEdgeToken(userId, secret, ttlSeconds = 120) {
  const payload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds
  };

  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const signature = await hmacSign(payloadB64, secret);

  return `${payloadB64}.${signature}`;
}


export async function verifyEdgeToken(token, secret) {
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return null;

  const expectedSig = await hmacSign(payloadB64, secret);
  if (expectedSig !== signature) return null;

  const payload = JSON.parse(base64urlDecode(payloadB64));
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}
