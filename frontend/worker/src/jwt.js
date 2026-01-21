import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

function key(secret) {
	return encoder.encode(secret);
}

export async function signJwt(payload, secret) {
	return new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("15m")
		.sign(key(secret));
}

export async function verifyJwt(token, secret) {
	const { payload } = await jwtVerify(token, key(secret));
	if (typeof payload.sub !== "string") {
		throw new Error("Invalid JWT payload");
	}
	return payload;
}

