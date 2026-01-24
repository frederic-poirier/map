
import { createEdgeToken } from '../utils/auth/edgeToken';
import { requireAuth } from '../utils/auth/requireAuth';

export async function onRequestGet({ request, env }) {
  const result = await requireAuth(request, env);
  if (result instanceof Response) return result;

  const { auth, headers } = result;

  const edgeToken = await createEdgeToken(
    auth.userId,
    env.EDGE_TOKEN_SECRET,
    120
  )

  return new Response(JSON.stringify({
    id: auth.userId,
    email: auth.email,
    name: auth.name,
    edgeToken,
    edgeTokenExpiresAt: Math.floor(Date.now() / 1000) + 120,
    sessionExpiresAt: auth.expiresAt
  }), { status: 200, headers });
}

