
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

export function decodeJwt(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  
  const payloadB64 = parts[1];
  // Handle base64url encoding
  const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
  const payload = JSON.parse(atob(base64));
  
  return payload;
}
