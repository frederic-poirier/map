import { getCookie } from "hono/cookie";
import { verifySession } from "../lib/auth-utils";

export const authMiddleware = async (c, next) => {
    const session = getCookie(c, "auth_session");
    const userEmail = await verifySession(session);

    if (!userEmail) return c.json({ authenticated: false }, 401);

    c.set("userEmail", userEmail);
    await next();
};
