import { JWT_SECRET } from "../config.js";

export async function signSession(email) {
    const payload = JSON.stringify({
        email,
        exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days expiration
    });
    const signature = await Bun.password.hash(payload + JWT_SECRET);
    return Buffer.from(`${payload}|${signature}`).toString("base64");
}

export async function verifySession(cookieValue) {
    if (!cookieValue) return null;
    try {
        const decoded = Buffer.from(cookieValue, "base64").toString("utf-8");
        const [payloadStr, signature] = decoded.split("|");
        const isValid = await Bun.password.verify(
            payloadStr + JWT_SECRET,
            signature
        );
        if (!isValid) return null;
        const payload = JSON.parse(payloadStr);
        return payload.exp > Date.now() ? payload.email : null;
    } catch {
        return null;
    }
}
