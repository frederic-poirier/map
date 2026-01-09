import { getCookie } from "hono/cookie";
import { verifySession } from "../lib/auth-utils";
import { db } from "../db/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const authMiddleware = async (c, next) => {
    const session = getCookie(c, "auth_session");
    const userEmail = await verifySession(session);

    if (!userEmail) return c.json({ authenticated: false }, 401);
    let user =
        db
            .select({ id: users.id, email: users.email })
            .from(users)
            .where(eq(users.email, userEmail))
            .get() ||
        db
            .insert(users)
            .values({
                email: userEmail,
                username: userEmail.split("@")[0],
            })
            .returning({ id: users.id, email: users.email })
            .get();

    c.set("userEmail", user.email);
    c.set("userId", user.id);
    await next();
};
