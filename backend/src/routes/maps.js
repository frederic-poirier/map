import { Hono } from "hono";
import { db } from "../db/db.js";
import * as schema from "../db/schema.js";
import { eq, and } from "drizzle-orm";

const maps = new Hono();

maps.get("/search", async (c) => {
    const query = c.req.query("q");
    const lat = c.req.query("lat");
    const lon = c.req.query("lon");
    const scale = c.req.query("location_bias_scale") || "0.5";
    if (!query || query.length < 3) {
        return c.json({ results: [] });
    }

    try {
        const photonURL = new URL("http://0.0.0.0:5000/api");
        photonURL.searchParams.set("q", query);
        photonURL.searchParams.set("limit", "5");
        photonURL.searchParams.set("lat", lat);
        photonURL.searchParams.set("lon", lon);
        photonURL.searchParams.set("location_bias_scale", scale);
        photonURL.searchParams.append("bbox", "-73.93,45.31,-73.41,45.74");
        const response = await fetch(photonURL.toString());
        const data = await response.json();
        return c.json(data);
    } catch (error) {
        console.log("Error fetching search results:", error);
        return c.json({ error: "Error fetching search results" }, 500);
    }
});

maps.post("/location", async (c) => {
    const { latitude, longitude, name } = await c.req.json();
    const userId = c.get("userId");
    if (!latitude || !longitude || !name) {
        return c.json({ error: "Missing required fields" }, 400);
    }
    try {
        const timestamp = Date.now();
        await db.insert(schema.location).values({
            userId,
            latitude,
            longitude,
            name,
            timestamp,
        });
        return c.json({ success: true });
    } catch (error) {
        console.log("Error saving location:", error);
        return c.json({ error: "Error saving location" }, 500);
    }
});

maps.get("/locations", async (c) => {
    const userId = c.get("userId");
    try {
        const locations = await db
            .select()
            .from(schema.location)
            .where(eq(schema.location.userId, userId))
            .orderBy(schema.location.timestamp);
        return c.json({ locations });
    } catch (error) {
        console.log("Error fetching locations:", error);
        return c.json({ error: "Error fetching locations" }, 500);
    }
});

maps.delete("/location/:id", async (c) => {
    const userId = c.get("userId");
    const locationId = c.req.param("id");
    
    if (!locationId) {
        return c.json({ error: "Missing location ID" }, 400);
    }
    
    try {
        const result = await db
            .delete(schema.location)
            .where(
                and(
                    eq(schema.location.id, locationId),
                    eq(schema.location.userId, userId)
                )
            );
        return c.json({ success: true });
    } catch (error) {
        console.log("Error deleting location:", error);
        return c.json({ error: "Error deleting location" }, 500);
    }
});

export { maps };
