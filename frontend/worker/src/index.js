import { handleAuth } from "./auth";
import { handleApi } from "./api";

export default {
	async fetch(request, env) {
		try {
			const authResponse = await handleAuth(request, env);
			if (authResponse) return authResponse;

			const apiResponse = await handleApi(request, env);
			if (apiResponse) return apiResponse;

			return new Response("Not Found", { status: 404 });
		} catch (err) {
			console.error(err);
			return new Response("Server error", { status: 500 });
		}
	},
};

