import { Hono } from "hono";
import { db } from "../db/db.js";
import * as schema from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { OSM_VERSION } from "../config.js";

const maps = new Hono();

// Deterministic place ID generator (aligns with frontend util)
const generatePlaceId = (lat, lon) => {
    const latNum = typeof lat === "string" ? parseFloat(lat) : lat;
    const lonNum = typeof lon === "string" ? parseFloat(lon) : lon;
    return `${latNum.toFixed(6)}_${lonNum.toFixed(6)}`.replace(/\./g, "-");
};

// OTP GraphQL endpoint
const OTP_URL = process.env.OTP_URL || "http://localhost:8080";

// OTP trip planning GraphQL query
const PLAN_QUERY = `
query Plan($from: InputCoordinates!, $to: InputCoordinates!, $numItineraries: Int, $time: String, $date: String) {
  plan(
    from: $from
    to: $to
    numItineraries: $numItineraries
    time: $time
    date: $date
    transportModes: [
      { mode: TRANSIT },
      { mode: WALK }
    ]
  ) {
    itineraries {
      startTime
      endTime
      duration
      walkTime
      waitingTime
      legs {
        mode
        startTime
        endTime
        duration
        distance
        from {
          name
          lat
          lon
          stop {
            gtfsId
            code
          }
        }
        to {
          name
          lat
          lon
          stop {
            gtfsId
            code
          }
        }
        route {
          gtfsId
          shortName
          longName
          color
          textColor
        }
        intermediateStops {
          name
          lat
          lon
          gtfsId
        }
        legGeometry {
          points
        }
      }
    }
  }
}
`;

// Plan a trip using OTP
maps.post("/otp/plan", async (c) => {
    try {
        const { from, to, time, date, numItineraries = 5 } = await c.req.json();

        if (!from || !to || !from.lat || !from.lon || !to.lat || !to.lon) {
            return c.json({ error: "Missing required coordinates" }, 400);
        }

        console.log("Planning trip with variables:", {
            from,
            to,
            time,
            date,
            numItineraries,
        });

        const variables = {
            from: { lat: from.lat, lon: from.lon },
            to: { lat: to.lat, lon: to.lon },
            numItineraries,
            time: time || new Date().toTimeString().slice(0, 5),
            date: date || new Date().toISOString().slice(0, 10),
        };

        const response = await fetch(`${OTP_URL}/otp/gtfs/v1`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: PLAN_QUERY,
                variables,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OTP error:", errorText);
            return c.json({ error: "Failed to plan trip" }, 500);
        }

        const data = await response.json();

        if (data.errors) {
            console.error("OTP GraphQL errors:", data.errors);
            return c.json(
                { error: data.errors[0]?.message || "Failed to plan trip" },
                500
            );
        }

        return c.json(data.data.plan);
    } catch (error) {
        console.error("Error planning trip:", error);
        return c.json({ error: "Error planning trip" }, 500);
    }
});

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
        photonURL.searchParams.set("limit", "15");
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

maps.post("/saved-place", async (c) => {
    const { name, osmObject } = await c.req.json();
    const userId = c.get("userId");
    if (!osmObject || !name) {
        return c.json({ error: "Missing required fields" }, 400);
    }
    try {
        const timestamp = Date.now();
        await db.insert(schema.location).values({
            userId,
            OSM_object: JSON.stringify(osmObject),
            OSM_version: OSM_VERSION,
            name,
            timestamp,
        });

        return c.json({ success: true });
    } catch (error) {
        console.error("Error saving location:", error.message, error.stack);
        return c.json({ error: error.message || "Error saving location" }, 500);
    }
});

maps.get("/place", async (c) => {
    const lat = c.req.query("lat");
    const lon = c.req.query("lon");

    if (!lat || !lon) return c.json({ results: [] });

    try {
        const photonURL = new URL("http://0.0.0.0:5000/reverse");
        photonURL.searchParams.set("lat", lat);
        photonURL.searchParams.set("lon", lon);
        const response = await fetch(photonURL.toString());
        const data = await response.json();
        return c.json(data.features[0]);
    } catch (error) {
        console.log("Error fetching search results:", error);
        return c.json({ error: "Error fetching search results" }, 500);
    }
});

maps.get("/saved-place", async (c) => {
    const userId = c.get("userId");
    try {
        const rows = await db
            .select()
            .from(schema.location)
            .where(eq(schema.location.userId, userId))
            .orderBy(schema.location.timestamp);
        const locations = rows.map((loc) => {
            return { ...loc };
        });
        return c.json({ locations });
    } catch (error) {
        console.log("Error fetching places:", error);
        return c.json({ error: "Error fetching saved places" }, 500);
    }
});

maps.delete("/saved-place/:id", async (c) => {
    const userId = c.get("userId");
    const placeId = c.req.param("id");

    if (!placeId) {
        return c.json({ error: "Missing place ID" }, 400);
    }

    try {
        const result = await db
            .delete(schema.location)
            .where(
                and(
                    eq(schema.location.id, placeId),
                    eq(schema.location.userId, userId)
                )
            );
        return c.json({ success: true });
    } catch (error) {
        console.log("Error unsaving place:", error);
        return c.json({ error: "Error unsaving place" }, 500);
    }
});

export { maps };
