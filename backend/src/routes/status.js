import { Hono } from "hono";

const statusRoute = new Hono();

statusRoute.get("/", async (c) => {
    return c.json({ status: "ok", mode: process.env.NODE_ENV, timestamp: Date.now() });
});

export { statusRoute };