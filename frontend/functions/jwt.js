
import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

export async function signJwt(payload, secret) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(encoder.encode(secret));
}

export async function verifyJwt(token, secret) {
  const { payload } = await jwtVerify(
    token,
    encoder.encode(secret)
  );
  return payload;
}
