import { signJwt } from "./jwt";
import { requireEnv } from "./env";
import { jwtVerify, createRemoteJWKSet } from "jose";

const googleJWKS = createRemoteJWKSet(
	new URL("https://www.googleapis.com/oauth2/v3/certs")
);

export async function handleAuth(request, env) {
	requireEnv(env, [
		"JWT_SECRET",
		"GOOGLE_CLIENT_ID",
		"GOOGLE_CLIENT_SECRET",
		"GOOGLE_REDIRECT_URI",
		"WHITELIST_EMAILS",
	]);

	const url = new URL(request.url);

	// --- START GOOGLE OAUTH ---
	if (url.pathname === "/auth/google/start") {
		const state = crypto.randomUUID();

		const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
		googleUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
		googleUrl.searchParams.set("redirect_uri", env.GOOGLE_REDIRECT_URI);
		googleUrl.searchParams.set("response_type", "code");
		googleUrl.searchParams.set("scope", "openid email profile");
		googleUrl.searchParams.set("state", state);

		return new Response(null, {
			status: 302,
			headers: {
				Location: googleUrl.toString(),
				"Set-Cookie": `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax`,
			},
		});
	}

	// --- GOOGLE CALLBACK ---
	if (url.pathname === "/auth/google/callback") {
		const code = url.searchParams.get("code");
		const returnedState = url.searchParams.get("state");

		const cookieState = request.headers
			.get("cookie")
			?.match(/oauth_state=([^;]+)/)?.[1];

		if (!code || !returnedState || returnedState !== cookieState) {
			return new Response("Invalid OAuth state", { status: 401 });
		}

		// Exchange code → tokens
		const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				code,
				client_id: env.GOOGLE_CLIENT_ID,
				client_secret: env.GOOGLE_CLIENT_SECRET,
				redirect_uri: env.GOOGLE_REDIRECT_URI,
				grant_type: "authorization_code",
			}),
		});

		const tokenData = await tokenRes.json();
		const idToken = tokenData.id_token;
		if (!idToken) {
			return new Response("No id_token", { status: 401 });
		}

		// Verify Google ID token cryptographically
		const { payload } = await jwtVerify(idToken, googleJWKS, {
			issuer: "https://accounts.google.com",
			audience: env.GOOGLE_CLIENT_ID,
		});

		const email = payload.email;
		if (typeof email !== "string") {
			return new Response("No email", { status: 401 });
		}

		// Whitelist
		const whitelist = env.WHITELIST_EMAILS.split(",").map(e => e.trim());
		if (!whitelist.includes(email)) {
			return new Response("Forbidden", { status: 403 });
		}

		// Sign OUR JWT
		const jwt = await signJwt(
			{ sub: email, email },
			env.JWT_SECRET
		);

		const frontendUrl = env.FRONTEND_ORIGIN || "http://localhost:5173"
		console.log('lol')

		return Response.redirect(`${frontendUrl}/callback?token=${encodeURIComponent(jwt)}`, 302)
	}

	return null;
}
