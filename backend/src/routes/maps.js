import { Hono } from "hono";

const maps = new Hono();

maps.get("/search", async (c) => {
    const query = c.req.query("q");
    if (!query || query.length < 3) {
        return c.json({ results: [] });
    }

    try {
        const photonURL = new URL("http://0.0.0.0:2322/api");
        photonURL.searchParams.set("q", query);
        photonURL.searchParams.set("limit", "5");
        photonURL.searchParams.set("lat", "45.5017");
        photonURL.searchParams.set("lon", "-73.5673");
        photonURL.searchParams.append("bbox", "-73.93,45.31,-73.41,45.74");
        const response = await fetch(photonURL.toString());
        const data = await response.json();
        return c.json(data);
    } catch (error) {
        console.log("Error fetching search results:", error);
        return c.json({ error: "Error fetching search results" }, 500);
    }
});

export { maps };
