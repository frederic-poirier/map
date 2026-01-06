import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./src/routes/auth.js";
import { maps } from "./src/routes/maps.js";
import { authMiddleware } from "./src/middlewares/auth.js";
import { FRONTEND_URL } from "./src/config.js";

const app = new Hono();

app.use(
    "*",
    cors({
        origin: FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
);

app.route("/", auth);
app.use("/api/*", authMiddleware);
app.route("/api", maps);

export default {
    port: 3000,
    fetch: app.fetch,
};
