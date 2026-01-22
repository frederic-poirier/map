import { Hono } from "hono";
import { maps } from "./src/routes/maps.js";
import { statusRoute } from "./src/routes/status.js";

const app = new Hono();

app.route("/api", maps);
app.route("/status", statusRoute);

export default {
  port: 4000,
  fetch: app.fetch,
};
