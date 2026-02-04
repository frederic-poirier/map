DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS places;
DROP TABLE IF EXISTS Savedplaces;
DROP TABLE IF EXISTS Search_history;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS places (
  id TEXT PRIMARY KEY,
  geohash5 TEXT NOT NULL,
  name TEXT,
  address TEXT,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  geojson TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_places_geohash5 ON places(geohash5);
CREATE INDEX idx_places_latlon ON places(lat, lon);

CREATE TABLE IF NOT EXISTS saved_places (
  user_id TEXT NOT NULL,
  place_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,

  PRIMARY KEY (user_id, place_id),
  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  FOREIGN KEY (place_id)
    REFERENCES places(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS search_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  place_id TEXT NOT NULL,
  query TEXT,
  created_at INTEGER NOT NULL,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  FOREIGN KEY (place_id)
    REFERENCES places(id)
    ON DELETE CASCADE
);
