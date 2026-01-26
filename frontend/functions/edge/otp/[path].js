import { verifyEdgeToken } from "../../utils/auth/edgeToken";

export async function onRequest({ request, env, params }) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 })
  }

  const token = authHeader.slice(7);
  const payload = await verifyEdgeToken(token, env.EDGE_TOKEN_SECRET);

  if (!payload) return new Response('Unauthorized', { status: 401 })

  const url = new URL(request.url);
  const subPath = params.path ? params.path : '';
  const target = `${env.OTP_INTERNAL_URL}/${subPath}${url.search}`
  const res = await fetch(target, {
    headers: {
      'Accept': 'application/json',
      'CF-Access-Client-Id': env.CF_ACCESS_CLIENT_ID,
      'CF-Access-Client-Secret': env.CF_ACCESS_CLIENT_SECRET
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
