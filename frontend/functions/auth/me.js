
import { requireAuth } from '../utils/auth/requireAuth';

export async function onRequestGet({ request, env }) {
  const result = await requireAuth(request, env);
  if (result instanceof Response) return result;

  const { auth, headers } = result;


  return new Response(JSON.stringify({
    id: auth.userId,
    email: auth.email,
    name: auth.name,
    sessionExpiresAt: auth.expiresAt
  }), { status: 200, headers });
}

