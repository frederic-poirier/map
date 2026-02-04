# Search Architecture Documentation

This document explains the architecture of search, photon, place, and related components in the mapping application.

## Table of Contents
1. [Overview](#overview)
2. [Folder Structure](#folder-structure)
3. [Key Components](#key-components)
4. [Key Hooks](#key-hooks)
5. [Data Flow](#data-flow)
6. [Usage Examples](#usage-examples)
7. [API Reference](#api-reference)

---

## Overview

This is a **SolidJS** mapping application with search functionality powered by **Photon** (open-source geocoding service). The app uses MapLibre GL for mapping and follows a layered architecture with clear separation between hooks, components, contexts, and utilities.

### Key Technologies
- **Frontend Framework**: SolidJS
- **Mapping**: MapLibre GL
- **Geocoding**: Photon (via local gateway)
- **State Management**: SolidJS signals and stores
- **Caching**: Two-tier cache (search results + place data)

---

## Folder Structure

```
/frontend/src/
├── App.jsx                    # Main routing configuration
├── Map.jsx                    # MapLibre GL map initialization
├── hooks/
│   ├── useSearchPlace.js      # Search place functionality hook
│   ├── usePhoton.js           # Photon API integration hook
│   ├── usePlaces.js           # Place cache management & utilitiesk
│   ├── useTunnel.js           # API fetch utility
│   ├── useMap.js              # Map context access hook
│   └── useScreen.js           # Screen size & theme utilities
├── components/
│   ├── SearchPlaces.jsx       # Search input & results components
│   ├── Layout.jsx             # App layout with bottom sheet
│   └── BottomSheet.jsx        # Mobile bottom sheet wrapper
├── pages/
│   ├── Home.jsx               # Home page with search
│   ├── Place.jsx              # Place details page
│   └── Direction.jsx          # Directions page
├── context/
│   ├── MapContext.jsx         # Map instance context
│   └── SheetProvider.jsx      # Bottom sheet state management
└── features/place/
    └── PlaceIcon.js           # Place icon mapping utilities

/backend/gateway/
└── server.js                  # Gateway server proxying to Photon
```

---

## Key Components

### SearchPlaces.jsx

Main search UI component with three sub-components:

#### 1. SearchPlaceInput
Search input field with icon, clear button, and event handlers.

**Props:**
```javascript
{
  query: string,           // Current search query
  setQuery: Function,      // Setter for query
  loading?: boolean,       // Loading state
  onFocus?: Function,      // Focus handler
  onBlur?: Function,       // Blur handler
  onSubmit?: Function,     // Submit handler
  placeholder?: string,    // Placeholder text
  inputRef?: Ref,          // Input element ref
  class?: string           // Additional CSS classes
}
```

**Usage:**
```jsx
import { SearchPlaceInput } from "../components/SearchPlaces";

function MyComponent() {
  const [query, setQuery] = createSignal("");
  
  return (
    <SearchPlaceInput
      query={query()}
      setQuery={setQuery}
      placeholder="Search places..."
      onSubmit={() => console.log("Submitted:", query())}
    />
  );
}
```

#### 2. SearchPlaceResults
Results list container with "no results" fallback.

**Props:**
```javascript
{
  results: Array<string>,  // Array of place IDs
  onSelect: Function,      // Selection handler (placeId) => void
  loading?: boolean        // Loading state
}
```

**Usage:**
```jsx
import { SearchPlaceResults } from "../components/SearchPlaces";

function MyComponent() {
  const [results, setResults] = createSignal([]);
  
  const handleSelect = (placeId) => {
    console.log("Selected:", placeId);
  };
  
  return (
    <SearchPlaceResults
      results={results()}
      onSelect={handleSelect}
    />
  );
}
```

#### 3. ResultItem
Individual search result item (used internally by SearchPlaceResults).

---

## Key Hooks

### useSearchPlace

**Location:** `hooks/useSearchPlace.js`

High-level hook that combines search query state with Photon API calls and map bias.

**Returns:**
```javascript
{
  query: Signal<string>,      // Current search query
  setQuery: Function,         // Setter for query
  bias: Signal<Object>,       // Map camera bias {lat, lon, zoom}
  setBias: Function,          // Setter for bias
  results: Accessor<Array>,   // Search results (place IDs)
  loading: Accessor<boolean>  // Loading state
}
```

**Usage:**
```jsx
import { useSearchPlace } from "../hooks/useSearchPlace";

function SearchPage() {
  const search = useSearchPlace();
  
  return (
    <div>
      <input
        value={search.query()}
        onInput={(e) => search.setQuery(e.target.value)}
      />
      
      <Show when={search.loading()}>
        <p>Loading...</p>
      </Show>
      
      <For each={search.results()}>
        {(placeId) => <ResultItem placeId={placeId} />}
      </For>
    </div>
  );
}
```

**How it works:**
1. Listens to `query` signal changes
2. Combines query with map camera `bias` (location bias)
3. Uses `createResource` for reactive data fetching
4. Calls `usePhoton().searchResults()` to fetch from API
5. Automatically caches results by geohash + zoom

---

### usePhoton

**Location:** `hooks/usePhoton.js`

Core Photon API integration with caching layer.

**Returns:**
```javascript
{
  searchResults: Function,    // (searchQuery) => Promise<Array>
  reverseResult: Function     // (placeId) => Promise<Object>
}
```

#### searchResults(searchQuery)
Forward geocoding (text → places).

**Parameters:**
```javascript
{
  query: string,              // Search text
  bias: {                     // Optional location bias
    lat: number,
    lon: number,
    zoom: number
  }
}
```

**Returns:** Array of place IDs

**Example:**
```jsx
import { usePhoton } from "../hooks/usePhoton";

function MySearch() {
  const photon = usePhoton();
  
  const handleSearch = async () => {
    const placeIds = await photon.searchResults({
      query: "cafe",
      bias: { lat: 45.5, lon: -73.5, zoom: 12 }
    });
    console.log("Found places:", placeIds);
  };
  
  return <button onClick={handleSearch}>Search</button>;
}
```

#### reverseResult(placeId)
Reverse geocoding (coordinates → place details).

**Parameters:**
- `placeId`: Geohash-encoded place ID

**Returns:** Place object

**Example:**
```jsx
const place = await photon.reverseResult("u6f8d1k2j3");
console.log(place.properties.name);
```

---

### usePlaces

**Location:** `hooks/usePlaces.js`

Place entity management, caching, and utility functions.

**Utility Functions:**
```javascript
// Get display name for a place
getPlaceName(place) -> string

// Get formatted address
getPlaceAddress(place) -> string

// Get icon component for place type
getPlaceIcon(place) -> Component

// Add place to cache
addPlaceCache(place) -> void

// Check if place is cached
hasPlaceCache(id) -> boolean

// Get place from cache
getPlaceCache(id) -> Object | undefined

// Encode coordinates to place ID
encodePlaceId(lat, lng) -> string

// Decode place ID to coordinates
decodePlaceId(id) -> { lat, lng }
```

#### usePlaceById(id)
Reactive hook for fetching a place by ID with cache-first strategy.

**Parameters:**
- `id`: Place ID (geohash)

**Returns:** Accessor<Object | undefined>

**Usage:**
```jsx
import { usePlaceById, getPlaceName, getPlaceAddress } from "../hooks/usePlaces";

function PlaceDetails({ placeId }) {
  const place = usePlaceById(placeId);
  
  return (
    <Show when={place()}>
      <div>
        <h1>{getPlaceName(place())}</h1>
        <p>{getPlaceAddress(place())}</p>
      </div>
    </Show>
  );
}
```

---

### useTunnel

**Location:** `hooks/useTunnel.js`

API fetch abstraction with environment-based URL routing.

**Functions:**
```javascript
tunnelFetch({ path, params }) -> Promise<Response>
```

**Usage:**
```jsx
import { tunnelFetch } from "../hooks/useTunnel";

async function fetchData() {
  const response = await tunnelFetch({
    path: "/photon/api",
    params: { q: "restaurant", limit: 5 }
  });
  const data = await response.json();
  return data;
}
```

---

### useMap

**Location:** `hooks/useMap.js`

Access to MapLibre GL map instance from context.

**Returns:** MapLibre GL map instance

**Usage:**
```jsx
import { useMap } from "../hooks/useMap";

function MyComponent() {
  const map = useMap();
  
  const flyToLocation = () => {
    map.flyTo({
      center: [-73.5, 45.5],
      zoom: 14
    });
  };
  
  return <button onClick={flyToLocation}>Fly to Montreal</button>;
}
```

---

## Data Flow

```
User Input
    │
    ▼
┌─────────────────┐
│  useSearchPlace │ (manages query state)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  createMemo()   │ (combines query + bias)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ createResource  │ (reactive data fetching)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   usePhoton     │ (API layer)
│  searchResults  │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌─────────┐
│ Cache │ │  Miss   │
│ Hit   │ └────┬────┘
└───┬───┘      │
    │          ▼
    │    ┌─────────────┐
    │    │  useTunnel  │ (fetch)
    │    └──────┬──────┘
    │           │
    │           ▼
    │    ┌─────────────┐
    │    │   Gateway   │ (proxy)
    │    └──────┬──────┘
    │           │
    │           ▼
    │    ┌─────────────┐
    │    │    Photon   │ (geocoding service)
    │    └─────────────┘
    │
    ▼
┌─────────────────┐
│  usePlaces      │ (cache results)
│  addPlaceCache  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SearchPlaceResults │ (render UI)
└─────────────────┘
```

---

## Usage Examples

### Example 1: Basic Search Page

```jsx
// pages/Search.jsx
import { createSignal, Show, For } from "solid-js";
import { useSearchPlace } from "../hooks/useSearchPlace";
import { SearchPlaceInput, SearchPlaceResults } from "../components/SearchPlaces";

export default function Search() {
  const search = useSearchPlace();
  
  const handleSelect = (placeId) => {
    console.log("Selected:", placeId);
    // Navigate to place details or add marker
  };
  
  return (
    <div class="search-page">
      <SearchPlaceInput
        query={search.query()}
        setQuery={search.setQuery}
        loading={search.loading()}
        placeholder="Search for places..."
      />
      
      <SearchPlaceResults
        results={search.results()}
        onSelect={handleSelect}
        loading={search.loading()}
      />
    </div>
  );
}
```

### Example 2: Place Details Page

```jsx
// pages/PlaceDetails.jsx
import { useParams } from "@solidjs/router";
import { Show } from "solid-js";
import { usePlaceById, getPlaceName, getPlaceAddress, getPlaceIcon } from "../hooks/usePlaces";
import { useMap } from "../hooks/useMap";

export default function PlaceDetails() {
  const params = useParams();
  const map = useMap();
  const place = usePlaceById(params.id);
  
  const handleFlyTo = () => {
    const p = place();
    if (p) {
      const [lng, lat] = p.geometry.coordinates;
      map.flyTo({ center: [lng, lat], zoom: 16 });
      map.addMarker({ lng, lat });
    }
  };
  
  return (
    <Show when={place()} fallback={<div>Loading...</div>}>
      <div class="place-details">
        <h1>{getPlaceName(place())}</h1>
        <p>{getPlaceAddress(place())}</p>
        <button onClick={handleFlyTo}>Show on Map</button>
      </div>
    </Show>
  );
}
```

### Example 3: Debounced Search

```jsx
// components/DebouncedSearch.jsx
import { createSignal, createEffect } from "solid-js";
import { useSearchPlace } from "../hooks/useSearchPlace";

export default function DebouncedSearch() {
  const [inputValue, setInputValue] = createSignal("");
  const search = useSearchPlace();
  
  // Debounce input by 300ms
  let debounceTimer;
  createEffect(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      search.setQuery(inputValue());
    }, 300);
  });
  
  return (
    <input
      type="text"
      value={inputValue()}
      onInput={(e) => setInputValue(e.target.value)}
      placeholder="Type to search..."
    />
  );
}
```

### Example 4: Custom Search with Manual Photon Call

```jsx
// components/CustomSearch.jsx
import { createSignal, createResource } from "solid-js";
import { usePhoton } from "../hooks/usePhoton";
import { usePlaces, addPlaceCache } from "../hooks/usePlaces";

export default function CustomSearch() {
  const [query, setQuery] = createSignal("");
  const photon = usePhoton();
  
  // Manual resource creation
  const [results] = createResource(query, async (q) => {
    if (!q || q.length < 2) return [];
    
    const placeIds = await photon.searchResults({
      query: q,
      bias: { lat: 45.5, lon: -73.5, zoom: 12 }
    });
    
    return placeIds;
  });
  
  return (
    <div>
      <input
        value={query()}
        onInput={(e) => setQuery(e.target.value)}
      />
      
      <ul>
        <For each={results() || []}>
          {(placeId) => <li>{placeId}</li>}
        </For>
      </ul>
    </div>
  );
}
```

### Example 5: Location-Biased Search

```jsx
// components/LocationBiasedSearch.jsx
import { useSearchPlace } from "../hooks/useSearchPlace";
import { useMap } from "../hooks/useMap";

export default function LocationBiasedSearch() {
  const map = useMap();
  const search = useSearchPlace();
  
  const updateBias = () => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    
    search.setBias({
      lat: center.lat,
      lon: center.lng,
      zoom: zoom
    });
  };
  
  return (
    <div>
      <button onClick={updateBias}>
        Update Search Location
      </button>
      <p>
        Searching near: {search.bias().lat.toFixed(4)}, 
        {search.bias().lon.toFixed(4)}
      </p>
    </div>
  );
}
```

---

## API Reference

### Photon API Endpoints

The application communicates with Photon through a local gateway server.

**Base URL:** `http://localhost:4000` (dev) or `https://tunnel.frederic.dog` (prod)

#### Search Endpoint
```
GET /photon/api
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query |
| limit | number | No | Max results (default: 5) |
| lat | number | No | Latitude for location bias |
| lon | number | No | Longitude for location bias |
| zoom | number | No | Zoom level for bias weight |
| bbox | string | No | Bounding box filter |
| location_bias_scale | number | No | Bias strength (default: 0.1) |

**Response:** GeoJSON FeatureCollection
```json
{
  "features": [
    {
      "geometry": {
        "coordinates": [longitude, latitude]
      },
      "properties": {
        "name": "Place Name",
        "street": "Street Name",
        "housenumber": "123",
        "osm_key": "amenity",
        "osm_value": "restaurant"
      }
    }
  ]
}
```

#### Reverse Endpoint
```
GET /photon/reverse
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | number | Yes | Latitude |
| lon | number | Yes | Longitude |

**Response:** GeoJSON Feature

---

### Caching Strategy

The application implements a **two-tier caching system**:

#### Tier 1: Search Results Cache
- **Store:** `searchResultsCache` (SolidJS store in usePhoton.js)
- **Key Format:** `"${query}|${geohash}|z${zoom}"`
- **Value:** Array of place IDs
- **Purpose:** Prevent duplicate API calls for the same search in the same map area

#### Tier 2: Place Data Cache
- **Store:** `placesCache` (SolidJS store in usePlaces.js)
- **Key Format:** Geohash-encoded place ID
- **Value:** Full place object from Photon API
- **Purpose:** Avoid re-fetching place details when navigating to Place page

#### Cache Flow
```
1. User searches "cafe"
   → Check searchResultsCache
   → Miss → API call
   → Cache results in searchResultsCache
   → Store place details in placesCache

2. User clicks result
   → Check placesCache
   → Hit → Use cached data immediately

3. User searches "cafe" again
   → Check searchResultsCache
   → Hit → Return cached place IDs

4. User navigates to /place/:id
   → Check placesCache
   → Hit → No API call needed
```

---

## Best Practices

1. **Always use `useSearchPlace` for search UI** - It handles debouncing, bias, and caching automatically

2. **Use `usePlaceById` for place details** - It implements cache-first strategy

3. **Access map via `useMap`** - Don't create new map instances

4. **Leverage the cache** - Don't manually call Photon API unless necessary

5. **Use utility functions** - `getPlaceName`, `getPlaceAddress`, `getPlaceIcon` for consistent display

6. **Handle loading states** - Check `search.loading()` before showing results

7. **Implement debouncing** - For custom search inputs, debounce by ~300ms

---

## Troubleshooting

### Search not returning results
- Check if Photon service is running (`docker ps`)
- Verify gateway server is accessible
- Check browser console for CORS errors
- Ensure query is at least 2 characters

### Places not caching
- Verify place has valid coordinates
- Check that `addPlaceCache` is being called
- Inspect `placesCache` store in DevTools

### Map bias not working
- Ensure map is initialized before calling `useSearchPlace`
- Check that bias coordinates are valid numbers
- Verify zoom level is included in bias object

---

## Related Files

- `hooks/useSearchPlace.js` - Main search hook
- `hooks/usePhoton.js` - Photon API integration
- `hooks/usePlaces.js` - Place utilities and cache
- `hooks/useTunnel.js` - API fetch utility
- `components/SearchPlaces.jsx` - Search UI components
- `pages/Home.jsx` - Example usage in home page
- `pages/Place.jsx` - Example usage in place details
