
import { verifyJwt } from "../jwt";
import { requireEnv } from "../env";

export async function onRequest({ request, env }) {
  requireEnv(env, ["JWT_SECRET"]);

  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const payload = await verifyJwt(auth.slice(7), env.JWT_SECRET);

    return Response.json({
      userId: payload.sub,
      email: payload.email,
    });
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
}
