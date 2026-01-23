// functions/api/me.js

import { requireAuth } from '../utils/auth.js';

export async function onRequestGet({ request, env }) {
  console.log('me')

  const userOrError = await requireAuth(request, env);

  if (userOrError instanceof Response) {
    return userOrError;
  }

  const user = userOrError;

  return new Response(JSON.stringify({
    id: user.userId,
    email: user.email,
    name: user.name,
    sessionExpiresAt: user.expiresAt
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-cache'
    }
  });
}
