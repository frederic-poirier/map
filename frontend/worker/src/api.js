import { verifyJwt } from "./jwt";
import { requireEnv } from "./env";

export async function handleApi(request, env) {
	requireEnv(env, ["JWT_SECRET"]);

	const url = new URL(request.url);

	if (url.pathname === "/api/me") {
		const auth = request.headers.get("authorization");
		if (!auth?.startsWith("Bearer ")) {
			return new Response("Unauthorized", { status: 401 });
		}

		try {
			const token = auth.slice(7);
			const payload = await verifyJwt(token, env.JWT_SECRET);

			return Response.json({
				userId: payload.sub,
				email: payload.email,
			});
		} catch {
			return new Response("Unauthorized", { status: 401 });
		}
	}

	return null;
}
