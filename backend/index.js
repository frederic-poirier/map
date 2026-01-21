import { Hono } from "hono";
import { auth } from "./src/routes/auth.js";
import { maps } from "./src/routes/maps.js";
import { statusRoute } from "./src/routes/status.js";
import { authMiddleware } from "./src/middlewares/auth.js";


const app = new Hono();

app.route("/auth", auth);
app.route("/api", maps);
app.route("/status", statusRoute);
app.use("/api/*", authMiddleware);

export default {
  port: 4000,
  fetch: app.fetch,
};
