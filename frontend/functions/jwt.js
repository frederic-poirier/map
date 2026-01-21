import { jwtVerify, SignJWT } from "jose"

function getKey(secret) {
  return new TextEncoder().encode(secret)
}

export async function signJwt(payload, env, options) {
  const secret = env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET missing")

  const now = Math.floor(Date.now() / 1000)

  return await SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTIme(options?.expiresIn ?? "15m")
    .sign(getKey(secret))
}

export async function verifyJwt(token, env) {
  const secret = env.JWT_SECRET
  if (!secret) throw new Error("JWT SECRET missing")

  const { payload } = await jwtVerify(token, getKey(secret), {
    algorithms: ["HS256"]
  });

  if (typeof payload.sub !== "string") throw new Error("Invalid JWT payload")

  return {
    sub: payload.sub,
    email: typeof payload.email === "string" ? payload.email : undefined
  }
}


const token = await signJwt(
  { sub: "test-user", email: "test@example.com" },
  env
);

const payload = await verifyJwt(token, env);

console.log(token, payload);

