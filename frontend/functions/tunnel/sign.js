export async function onRequestGet({ request, env }) {
  const { searchParams } = new URL(request.url);

  const path = searchParams.get('path');
  if (!path || !path.startsWith('/')) {
    return new Response('Invalid path', { status: 400 });
  }

  const params = {};
  for (const [k, v] of searchParams.entries()) {
    if (k !== 'path') params[k] = v;
  }

  const ttl = 120;
  const exp = Math.floor(Date.now() / 1000) + ttl;

  const query = new URLSearchParams({
    ...params,
    exp
  }).toString();

  const base = `${path}?${query}`;
  const sig = await sign(base, env.TUNNEL_SECRET);

  return Response.json({
    url: `https://tunnel.frederic.dog${base}&sig=${sig}`,
    exp
  });
}

async function sign(data, secret) {
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

  return base64url(signature);
}

function base64url(bytes) {
  let binary = '';
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
