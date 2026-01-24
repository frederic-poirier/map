import { verifyEdgeToken } from "../utils/auth/edgeToken";

export async function onRequest({ request, env }) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 })
  }

  const token = authHeader.slice(7);
  const payload = await verifyEdgeToken(token, env.EDGE_TOKEN_SECRET);

  if (!payload) return new Response('Unauthorized', { status: 401 })

  const url = new URL(request.url);
  const target = `${env.PHOTON_INTERNAL_URL}${url.search}`

  const res = await fetch(target, {
    headers: {
      'Accept': 'application/json'
    }
  });

  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}
