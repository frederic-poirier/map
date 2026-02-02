DROP TABLE IF EXISTS "Users"
DROP TABLE IF EXISTS "Places"
DROP TABLE IF EXISTS "SearchHistory"
DROP TABLE IF EXISTS "SavedPlaces"

CREATE TABLE IF NOT EXISTS "Users" (
  "id" PRIMARY KEY VARCHAR(128),
  "name" TEXT,
  "email" TEXT,
)

CREATE TABLE IF NOT EXISTS "Places" (
  "id" PRIMARY KEY VARCHAR(32),
  "geojson" JSON,
  "geojson_version" INT
)

CREATE TABLE IF NOT EXISTS "SearchHistory" (
  ""
)