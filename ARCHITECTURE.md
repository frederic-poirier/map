# Architecture Overview

## Current Stack

### Frontend (Cloudflare Workers)
- **Framework**: SolidJS with Vite
- **Deployment**: Cloudflare Pages/Workers
- **Map**: MapLibre GL JS with PMTiles for vector tiles
- **Auth**: Google OAuth (JWT-based sessions)
- **Database**: Cloudflare D1 (SQLite)

### Backend Services (Node.js + Bun) - External Only
The backend folder contains only services that **cannot** run in Cloudflare Workers:

| Service | Port | Purpose |
|---------|------|---------|
| Photon | 5000 | Geocoding and search (Komoot/Photon) |
| OTP | 8080 | Trip planning (OpenTripPlanner with STM GTFS) |

**All other functionality (auth, user data, saved places, history) lives in the Cloudflare Worker.**

### Infrastructure
- **Tunnel**: Cloudflare Tunnel (`map-api`) exposes backend services on port 4000
- **Scripts**: `photon.sh`, `otp.sh`, `tunnel.sh` for service management

---

## Unified Place ID System

### Overview
To enable consistent place references across the entire application, we use a **Unified Place ID (UPID)** system. This allows querying a place once and accessing its data, saving status, and history across all services.

### UPID Format
```
upid:{source}:{source_id}
```

**Examples:**
- `upid:osm:node/123456` - OSM node
- `upid:osm:way/789012` - OSM way
- `upid:scrape:urbania/abc123` - Urbania venue
- `uptid:scrape:lemain/xyz789` - Le Main venue

### UPID Components
| Component | Description |
|-----------|-------------|
| `source` | Data source identifier (osm, scrape, custom) |
| `source_id` | Unique ID from the source system |

### OSM Place ID Format
```
osm:{type}/{id}
```
- **type**: `node`, `way`, or `relation`
- **id**: Numeric OSM ID

### UPID Registry Table (D1)

```sql
CREATE TABLE IF NOT EXISTS upid_registry (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_id TEXT NOT NULL,
  osm_data JSON,
  display_name TEXT,
  category TEXT,
  lat REAL,
  lon REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_upid_registry_source ON upid_registry(source, source_id);
CREATE INDEX IF NOT EXISTS idx_upid_registry_category ON upid_registry(category);
CREATE INDEX IF NOT EXISTS idx_upid_registry_location ON upid_registry(lat, lon);
```

### UPID Lookup Utility

```javascript
// utils/upid.js
export function generateUPID(source, sourceId) {
  return `upid:${source}:${sourceId}`;
}

export function parseUPID(upid) {
  const [, source, sourceId] = upid.split(':');
  return { source, sourceId };
}

export function generateOSMPID(type, osmId) {
  return `upid:osm:${type}/${osmId}`;
}

export function parseOSMPID(upid) {
  const [, , type, osmId] = upid.split(':');
  return { type, osmId: parseInt(osmId, 10) };
}
```

### Place Data Resolution

```javascript
// utils/placeResolver.js
export async function resolvePlaceByUPID(env, upid) {
  const registry = await env.DB.prepare(`
    SELECT * FROM upid_registry WHERE id = ?
  `).bind(upid).first();

  if (registry) {
    return {
      ...registry,
      osm_data: JSON.parse(registry.osm_data),
      source: 'registry'
    };
  }

  // Fallback: Parse and fetch from source
  const parsed = parseUPID(upid);
  if (parsed.source === 'osm') {
    return await fetchOSMData(parsed.sourceId);
  }

  throw new Error(`Unknown UPID: ${upid}`);
}

export async function getPlaceStatus(env, upid, userId) {
  const [saved, history] = await Promise.all([
    env.DB.prepare(`
      SELECT id FROM saved_places WHERE upid = ? AND user_id = ?
    `).bind(upid, userId).first(),

    env.DB.prepare(`
      SELECT id, count FROM search_history WHERE upid = ? AND user_id = ?
    `).bind(upid, userId).first()
  ]);

  return {
    isSaved: !!saved,
    savedId: saved?.id,
    inHistory: !!history,
    searchCount: history?.count || 0
  };
}
```

---

## Database Schema (D1)

### Core Tables

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  revoked_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- UPID Registry: Unified place ID storage
CREATE TABLE IF NOT EXISTS upid_registry (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_id TEXT NOT NULL,
  osm_data JSON,
  display_name TEXT,
  category TEXT,
  lat REAL,
  lon REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Search History: Track user searches
CREATE TABLE IF NOT EXISTS search_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  query TEXT NOT NULL,
  upid TEXT,
  osm_data JSON,
  count INTEGER DEFAULT 1,
  last_searched_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (upid) REFERENCES upid_registry(id)
);

-- Saved Places: User-saved locations
CREATE TABLE IF NOT EXISTS saved_places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  upid TEXT NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  folder_id INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (upid) REFERENCES upid_registry(id)
);

-- Place Folders: Organize saved places
CREATE TABLE IF NOT EXISTS place_folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  parent_id INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES place_folders(id)
);

-- Venues: External data (scraped sources)
CREATE TABLE IF NOT EXISTS venues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  source_id TEXT NOT NULL,
  upid TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  address TEXT,
  lat REAL,
  lon REAL,
  rating REAL,
  hours JSON,
  phone TEXT,
  website TEXT,
  photos JSON,
  tags JSON,
  scraped_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Venue Reviews
CREATE TABLE IF NOT EXISTS venue_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  venue_id INTEGER NOT NULL,
  author TEXT,
  rating REAL,
  text TEXT,
  date TEXT,
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
);

-- User Venue Interactions
CREATE TABLE IF NOT EXISTS user_venue_interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  venue_id INTEGER NOT NULL,
  interaction_type TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
);

-- Itineraries: Saved trip plans
CREATE TABLE IF NOT EXISTS itineraries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT,
  from_upid TEXT,
  to_upid TEXT,
  from_coords JSON,
  to_coords JSON,
  preferences JSON,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_upid_registry_source ON upid_registry(source, source_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id, last_searched_at);
CREATE INDEX IF NOT EXISTS idx_saved_places_user ON saved_places(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_venues_source ON venues(source, source_id);
CREATE INDEX IF NOT EXISTS idx_venues_location ON venues(lat, lon);
CREATE INDEX IF NOT EXISTS idx_user_venue_user ON user_venue_interactions(user_id, interaction_type);
```

---

## Enhanced Search Architecture

### Search Pipeline

```
User Input
    ↓
Frontend Debounce (300ms)
    ↓
Unified Search Endpoint
    ├─→ Photon API (geocoding)
    ├─→ Search History (personalized)
    ├─→ Saved Places (user's collection)
    ├─→ Venues Database (scraped sources)
    └─→ Future: External APIs
    ↓
Merge & Rank Results
    ↓
Enrich with User Context
    ↓
Return Unified Results
```

### Search Endpoint

```javascript
// GET /api/search?q={query}&lat={lat}&lon={lon}&limit={limit}
export async function search(env, request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const lat = parseFloat(url.searchParams.get('lat')) || null;
  const lon = parseFloat(url.searchParams.get('lon')) || null;
  const limit = parseInt(url.searchParams.get('limit')) || 10;

  const userId = await getUserId(request, env);

  const [photonResults, historyResults, savedResults, venueResults] = await Promise.all([
    searchPhoton(query, lat, lon, limit),
    searchHistory(env, query, userId),
    searchSavedPlaces(env, query, userId),
    searchVenues(env, query, lat, lon, limit)
  ]);

  const merged = mergeAndRankResults(
    photonResults,
    historyResults,
    savedResults,
    venueResults,
    userId
  );

  const enriched = await enrichWithUserContext(env, merged, userId);

  return jsonResponse(enriched);
}
```

### Result Interface

```typescript
interface SearchResult {
  upid: string;
  type: 'osm' | 'venue' | 'saved' | 'history';
  name: string;
  displayName: string;
  category: string;
  lat: number;
  lon: number;
  address?: string;
  distance?: number;
  relevance: number;

  // User context
  isSaved: boolean;
  savedId?: number;
  searchCount?: number;
  lastSearched?: string;

  // Source data
  source: 'photon' | 'saved' | 'history' | 'venue';
  rawData: object;

  // Venue-specific
  venueData?: {
    rating: number;
    category: string;
    photos: string[];
    hours: object;
  };
}
```

### Photon Search with Enhancement

```javascript
// utils/photon.js
export async function searchPhoton(query, lat, lon, limit = 10) {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
    bbox: ',-73.93,45.31,-73.41,45.74',
    lang: 'fr'
  });

  if (lat && lon) {
    params.set('lat', lat.toString());
    params.set('lon', lon.toString());
  }

  const response = await fetch(`${PHOTON_URL}/api?q=${params}`);
  const data = await response.json();

  return data.features.map((feature) => {
    const [lon, lat] = feature.geometry.coordinates;
    const props = feature.properties;
    const osmId = extractOSMId(props);

    return {
      upid: generateOSMPID(osmId.type, osmId.id),
      type: 'osm',
      name: props.name,
      displayName: props.name,
      category: props.osm_key || 'place',
      lat,
      lon,
      address: [props.housenumber, props.street, props.city, props.country]
        .filter(Boolean)
        .join(' '),
      relevance: props.score || 0.5,
      source: 'photon',
      rawData: feature,
      osmType: props.osm_type,
      osmId: osmId.id
    };
  });
}
```

### Search Result Merging

```javascript
// utils/searchMerger.js
export function mergeAndRankResults(photon, history, saved, venues, userId) {
  const results = new Map();

  // Add Photon results
  photon.forEach((r) => {
    results.set(r.upid, { ...r, relevance: r.relevance * 0.8 });
  });

  // Boost history results
  history.forEach((r) => {
    const existing = results.get(r.upid);
    if (existing) {
      existing.relevance = Math.min(1.0, existing.relevance + 0.2 * r.searchCount);
      existing.searchCount = r.searchCount;
      existing.lastSearched = r.lastSearched;
    } else {
      results.set(r.upid, {
        ...r,
        relevance: 0.7 + Math.min(0.2, r.searchCount * 0.05),
        source: 'history'
      });
    }
  });

  // Prioritize saved places
  saved.forEach((r) => {
    results.set(r.upid, {
      ...r,
      relevance: 0.95,
      isSaved: true,
      source: 'saved'
    });
  });

  // Add venue results
  venues.forEach((r) => {
    results.set(r.upid, {
      ...r,
      relevance: r.relevance * 0.9,
      type: 'venue',
      venueData: {
        rating: r.rating,
        category: r.category,
        photos: r.photos,
        hours: r.hours
      }
    });
  });

  // Sort by relevance and return top results
  return Array.from(results.values())
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 20);
}
```

### Extensible Source Interface

```javascript
// utils/searchSource.js
class SearchSource {
  constructor(name, weight = 1.0) {
    this.name = name;
    this.weight = weight;
  }

  async search(query, context) {
    throw new Error('Method not implemented');
  }

  async enrich(result, context) {
    return result;
  }
}

// Example: Custom venue source
class VenueSearchSource extends SearchSource {
  constructor() {
    super('venues', 0.9);
  }

  async search(query, { lat, lon }) {
    // Search venue database
    return await searchVenues(query, lat, lon);
  }

  async enrich(result, context) {
    // Add venue-specific data
    return {
      ...result,
      venueData: await getVenueDetails(result.upid)
    };
  }
}

// Registry for extensibility
export const searchSourceRegistry = {
  photon: new PhotonSearchSource(),
  history: new HistorySearchSource(),
  saved: new SavedPlacesSearchSource(),
  venues: new VenueSearchSource(),

  register(name, source) {
    this[name] = source;
  },

  async searchAll(query, context) {
    const results = await Promise.all(
      Object.values(this).map((source) => source.search(query, context))
    );
    return results.flat();
  }
};
```

---

## Venue Scraping System

### Extensible Scraper Architecture

```javascript
// utils/scrapers/base.js
class BaseScraper {
  constructor(name, config = {}) {
    this.name = name;
    this.baseUrl = config.baseUrl;
    this.rateLimit = config.rateLimit || 1000; // ms between requests
    this.lastRequest = 0;
  }

  async scrape(query) {
    throw new Error('Method not implemented');
  }

  async rateLimitedFetch(url) {
    const now = Date.now();
    const elapsed = now - this.lastRequest;
    if (elapsed < this.rateLimit) {
      await sleep(this.rateLimit - elapsed);
    }
    this.lastRequest = Date.now();
    return fetch(url);
  }

  normalizeToUPID(sourceId) {
    return `upid:scrape:${this.name}/${sourceId}`;
  }
}

// utils/scrapers/urbania.js
export class UrbaniaScraper extends BaseScraper {
  constructor() {
    super('urbania', { baseUrl: 'https://www.urbania.ca', rateLimit: 2000 });
  }

  async search(query) {
    // Search Urbania for listings
  }

  async scrapeDetails(sourceId) {
    // Scrape individual venue details
  }

  normalize(venue) {
    return {
      upid: this.normalizeToUPID(venue.id),
      source: 'urbania',
      sourceId: venue.id,
      name: venue.title,
      description: venue.description,
      category: venue.type, // apartment, condo, commercial
      address: venue.address,
      lat: venue.latitude,
      lon: venue.longitude,
      photos: venue.images,
      website: venue.url
    };
  }
}

// utils/scrapers/lemain.js
export class LeMainScraper extends BaseScraper {
  constructor() {
    super('lemain', { baseUrl: 'https://www.main.fr', rateLimit: 1500 });
  }

  async search(query) {
    // Search Le Main for venues/events
  }

  normalize(venue) {
    return {
      upid: this.normalizeToUPID(venue.id),
      source: 'lemain',
      sourceId: venue.id,
      name: venue.name,
      description: venue.description,
      category: venue.category, // restaurant, bar, event
      address: venue.address,
      lat: venue.lat,
      lon: venue.lon,
      rating: venue.rating,
      hours: venue.openingHours,
      phone: venue.phone,
      photos: venue.images
    };
  }
}

// utils/scrapers/index.js
export const scraperRegistry = {
  urbania: new UrbaniaScraper(),
  lemain: new LeMainScraper(),

  register(name, scraper) {
    this[name] = scraper;
  },

  async searchAll(query, location) {
    const results = await Promise.all(
      Object.values(this).map((scraper) => scraper.search(query, location))
    );
    return results.flat();
  },

  async scrapeVenue(upid) {
    const [, source, sourceId] = upid.split(':');
    const scraper = this[source];
    if (!scraper) throw new Error(`Unknown source: ${source}`);
    return await scraper.scrapeDetails(sourceId);
  }
};
```

### Scraping Pipeline

```javascript
// Scheduled task (Cloudflare Cron)
export async function runScrapingJob(env) {
  const queue = await getPendingScrapes(env);

  for (const item of queue) {
    const scraper = scraperRegistry[item.source];
    if (!scraper) continue;

    try {
      const data = await scraper.scrapeDetails(item.sourceId);

      await env.DB.prepare(`
        INSERT OR REPLACE INTO venues (
          source, source_id, upid, name, description, category,
          address, lat, lon, rating, hours, phone, website, photos, tags,
          scraped_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).bind(
        data.source, data.sourceId, data.upid, data.name, data.description,
        data.category, data.address, data.lat, data.lon, data.rating,
        JSON.stringify(data.hours), data.phone, data.website,
        JSON.stringify(data.photos), JSON.stringify(data.tags || [])
      ).run();

      await markScraped(env, item.id);
    } catch (error) {
      await recordError(env, item.id, error);
    }
  }
}
```

---

## OTP Service Integration

### Trip Planning Endpoint

```javascript
// functions/api/otp/plan.js
export async function planTrip(request, env) {
  const { from, to, time, date, modes } = await request.json();

  // Get coordinates for UPIDs
  const [fromCoords, toCoords] = await Promise.all([
    resolveCoords(from, env),
    resolveCoords(to, env)
  ]);

  const query = buildOTPQuery(fromCoords, toCoords, time, date, modes);
  const response = await fetch(`${env.OTP_URL}/gtfs/v1/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  });

  const itinerary = await response.json();

  // Enrich with UPIDs
  itinerary.legs = itinerary.legs.map((leg) => ({
    ...leg,
    from: { ...leg.from, upid: generatePlaceUPID(leg.from) },
    to: { ...leg.to, upid: generatePlaceUPID(leg.to) }
  }));

  return jsonResponse(itinerary);
}

function resolveCoords(upid, env) {
  if (typeof upid === 'string') {
    return env.DB.prepare(`
      SELECT lat, lon FROM upid_registry WHERE id = ?
    `).bind(upid).first().then((r) => ({ lat: r.lat, lon: r.lon }));
  }
  return upid; // Already coordinates
}
```

---

## Utils Architecture

### Core Utilities

```
utils/
├── upid.js           # UPID generation and parsing
├── placeResolver.js  # Resolve UPID to full data
├── photon.js         # Photon API integration
├── otp.js            # OTP service integration
├── searchMerger.js   # Merge search results
├── searchSource.js   # Extensible search source interface
├── scrapers/
│   ├── base.js       # Base scraper class
│   ├── urbania.js    # Urbania scraper
│   ├── lemain.js     # Le Main scraper
│   └── index.js      # Scraper registry
├── auth.js           # Authentication utilities
├── geo.js            # Geospatial helpers
├── cache.js          # Caching utilities
└── errors.js         # Error classes
```

### Geospatial Utilities

```javascript
// utils/geo.js
export function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function bboxFromPoint(lat, lon, radiusKm) {
  const latDelta = radiusKm / 111; // ~111km per degree
  const lonDelta = radiusKm / (111 * Math.cos(toRad(lat)));
  return {
    minLon: lon - lonDelta,
    minLat: lat - latDelta,
    maxLon: lon + lonDelta,
    maxLat: lat + latDelta
  };
}

export function nearbySearch(lat, lon, radiusKm, limit = 20) {
  const bbox = bboxFromPoint(lat, lon, radiusKm);
  return `
    SELECT * FROM upid_registry
    WHERE lat BETWEEN ? AND ?
    AND lon BETWEEN ? AND ?
    ORDER BY (
      (lat - ?) * (lat - ?) +
      (lon - ?) * (lon - ?)
    ) ASC
    LIMIT ?
  `;
}
```

### Caching Utilities

```javascript
// utils/cache.js
export class Cache {
  constructor(kv, prefix = 'cache:', ttlSeconds = 3600) {
    this.kv = kv;
    this.prefix = prefix;
    this.ttl = ttlSeconds * 1000;
  }

  async get(key, fetchFn) {
    const cached = await this.kv.get(`${this.prefix}${key}`);
    if (cached) return JSON.parse(cached);

    const data = await fetchFn();
    await this.kv.put(`${this.prefix}${key}`, JSON.stringify(data), {
      expirationTtl: this.ttlSeconds
    });
    return data;
  }

  async invalidate(key) {
    await this.kv.delete(`${this.prefix}${key}`);
  }

  async invalidatePrefix(prefix) {
    // List and delete keys with prefix
  }
}
```

---

## Authentication & Authorization

### Current Implementation
- Google OAuth 2.0
- JWT tokens (15 min expiry)
- Whitelist: `ALLOWED_EMAILS` env variable

### Future Enhancements
- Refresh tokens (long-lived)
- Role-based access (admin, user)
- Email verification flow

---

## Performance & Caching

### Caching Strategy
1. **Search Results**: Cloudflare KV (TTL: 1 hour)
2. **OTP Itineraries**: Cache by `(from, to, time, date)` (TTL: 5 min)
3. **Venue Data**: Cloudflare KV (TTL: 24 hours)
4. **UPID Registry**: Cache frequently accessed places (TTL: 7 days)
5. **Stop Arrivals**: No cache (real-time only)

### Optimization
- Debounce search input (300ms)
- Preload nearby places on app start
- Web Workers for heavy calculations
- Batch UPID lookups

---

## Security Considerations

- All sensitive data (API keys, secrets) in environment variables
- Cloudflare Tunnel for backend exposure (no public IP)
- SQL injection prevention (Drizzle ORM parameterized queries)
- XSS prevention (SolidJS auto-escaping)
- Rate limiting on API endpoints (to be added)
- CORS restrictions (Cloudflare Workers)
- Input sanitization for search queries

---

## Deployment

### Frontend (Cloudflare Workers)
- Cloudflare Pages (automatic deploys from git)
- Edge functions for auth and API proxying
- D1 database for data storage

### Backend Services (External)
- VPS/Dedicated server with Bun runtime
- Cloudflare Tunnel for external access
- PM2 or systemd for process management

### External Services
- Photon: Local machine (port 5000)
- OTP: Local machine (port 8080)
- STM API: External (rate limited)

---

## Monitoring & Observability

- Logging: Bun console + external service (Sentry/LogRocket)
- Error tracking: Sentry
- Analytics: Cloudflare Web Analytics
- Uptime monitoring: UptimeRobot or Pingdom

---

## API Endpoints

### Search & Places
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/search` | GET | Yes | Unified search (Photon + history + saved + venues) |
| `/api/place/:upid` | GET | Yes | Get place details by UPID |
| `/api/place/:upid/save` | POST | Yes | Save a place |
| `/api/place/:upid/unsave` | DELETE | Yes | Remove from saved places |

### Saved Places
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/saved-places` | GET | Yes | Get all saved places |
| `/api/saved-places/:id` | GET | Yes | Get single saved place |
| `/api/saved-places/:id` | DELETE | Yes | Delete saved place |
| `/api/saved-places/:id` | PUT | Yes | Update saved place |
| `/api/folders` | GET/POST | Yes | Manage folders |

### Search History
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/history` | GET | Yes | Get search history |
| `/api/history` | DELETE | Yes | Clear history |
| `/api/history/recent` | GET | Yes | Get recent searches |

### OTP Itineraries
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/otp/plan` | POST | Yes | Plan trip |
| `/api/otp/nearby` | GET | Yes | Get nearby stops |
| `/api/otp/stops/:id/arrivals` | GET | Yes | Get stop arrivals |

### Venues
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/venues` | GET | Yes | Search venues |
| `/api/venues/:id` | GET | Yes | Get venue details |
| `/api/venues/:id/reviews` | GET | Yes | Get venue reviews |
| `/api/venues/:id/interact` | POST | Yes | Record user interaction |

---

## Environment Variables

### Frontend (wrangler.toml)
```toml
[vars]
GOOGLE_CLIENT_ID = "..."
GOOGLE_REDIRECT_URI = "https://example.com/auth/google/callback"
FRONTEND_ORIGIN = "https://example.com"

[secrets]
GOOGLE_CLIENT_SECRET = ...
JWT_SECRET = ...
WHITELIST_EMAILS = "user1@example.com,user2@example.com"
PHOTON_URL = "https://map-api.example.com"
OTP_URL = "https://map-api.example.com/otp"
```

### Backend Services
```bash
# photon.sh / otp.sh
PHOTON_URL=http://0.0.0.0:5000
OTP_URL=http://localhost:8080
```

---

## Future Roadmap

1. **Phase 1** (Current)
   - ✅ Basic map with search (Photon)
   - ✅ Save/delete places
   - ✅ OTP itinerary planning
   - ✅ User authentication
   - ✅ Unified Place ID system
   - ✅ Enhanced search with history and saved places

2. **Phase 2** (In Progress)
   - ⏳ Venue scraping (Urbania, Le Main)
   - ⏳ Search result merging and ranking
   - ⏳ Place folders and organization
   - ⏳ User venue interactions

3. **Phase 3** (Future)
   - ⏳ Smart suggestions based on history
   - ⏳ Social features (share itineraries)
   - ⏳ Offline mode (PWA)
   - ⏳ Push notifications (trip reminders)
   - ⏳ Additional data sources

---

## Innovative Ideas

### 1. AI-Powered Place Recommendations
- Use user's search history and saved places to train a simple recommendation model
- Suggest places based on:
  - Time of day (coffee shops in morning, bars in evening)
  - Weather conditions (indoor venues when raining)
  - Past behavior patterns (favorite restaurant types)
- Implement using Cloudflare Workers + D1 for lightweight ML inference

### 2. Real-Time Venue Crowding
- Integrate with STM real-time data for transit crowding
- Crowdsource venue crowding data from users
- Show predicted crowdedness for stops and venues
- Machine learning model to predict based on time, day, weather

### 3. Collaborative Itineraries
- Share itinerary links with non-users
- Collaborative planning with real-time updates
- Comments and notes on itinerary points
- Version history for shared itineraries

### 4.AR Navigation
- Use device camera for turn-by-turn walking directions
- Overlay directions on real-world view
- Indoor navigation for malls, transit stations
- WebXR for AR implementation

### 5. Social Features
- "Recently visited" sharing with friends
- Venue reviews and ratings from trusted users
- Activity feeds based on followed users
- Meetup coordination at saved places

### 6. Offline Maps with User Data
- Download map tiles for offline use
- Sync saved places and itineraries locally
- Local search with IndexedDB
- Background sync when connection returns

### 7. Voice Search
- Speech-to-text for search queries
- Voice commands for navigation ("navigate home")
- Integration with mobile voice assistants
- Accessibility enhancement

### 8. Contextual Quick Actions
- Home screen widgets for quick actions
- Location-based quick actions (nearby transit when at station)
- Time-based suggestions (commute home at 5 PM)
- Calendar integration for trip planning

### 9. Carbon Footprint Tracking
- Calculate emissions for different transport modes
- Suggest lower-carbon alternatives
- Weekly/monthly carbon reports
- Gamification with emission savings

### 10. Multi-Modal Journey Optimizer
- Combine transit, bike-share, car-share, walking
- Cost optimization (cheapest route)
- Time optimization (fastest route)
- Preference-based routing (least walking, most scenic)

---

## File References

### Core Frontend Files
- `frontend/src/App.jsx` - Main application
- `frontend/src/Map.jsx` - Map component
- `frontend/src/pages/Home.jsx` - Home page
- `frontend/src/hooks/useAuth.js` - Auth state management

### Cloudflare Worker Functions
- `frontend/functions/api/search.js` - Unified search
- `frontend/functions/api/place.js` - Place management
- `frontend/functions/auth/google/callback.js` - OAuth processing
- `frontend/functions/api/otp/plan.js` - Trip planning

### Backend Services
- `backend/infra/photon.sh` - Photon service management
- `backend/infra/otp.sh` - OTP service management
- `backend/infra/tunnel.sh` - Tunnel management

### Utilities
- `utils/upid.js` - UPID utilities
- `utils/placeResolver.js` - Place resolution
- `utils/searchMerger.js` - Search result merging
- `utils/scrapers/` - Venue scrapers

### Configuration
- `frontend/wrangler.toml` - Worker configuration
- `frontend/schema.sql` - Database schema
- `backend/src/config.js` - Backend configuration
