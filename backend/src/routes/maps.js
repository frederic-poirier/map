import { Hono } from "hono";

const maps = new Hono();

maps.get("/search", async (c) => {
    const query = c.req.query("q");
    return c.json({ results: [], query });
});

export { maps };
