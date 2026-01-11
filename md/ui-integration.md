# UI Integration Guide

## Overview
This document describes how all the UI features integrate together, the data flow between contexts, and best practices for extending or modifying the application.

## Architecture Overview

### Context Hierarchy
The application uses SolidJS Context API for state management, organized in a provider hierarchy:

```
App
├── ThemeProvider
├── MapProvider
├── SearchProvider
│   └── Uses: MapContext, PlaceContext
├── PlaceProvider
├── LocationProvider
├── ItineraryProvider
└── AuthProvider
    └── Router
        └── Layout
            └── Pages (Home, Place, Directions, Profile)
```

### Context Dependencies
```
MapContext (Independent)
    ↑
    ├── SearchContext
    ├── PlaceContext
    ├── ItineraryContext
    └── LocationContext

PlaceContext
    ↑
    ├── SearchContext
    └── ItineraryContext

LocationContext
    ↑
    ├── SearchContext
    └── ItineraryContext

ThemeContext (Independent)

AuthContext (Independent)
```

## Feature Integration Patterns

### 1. Search → Place → Map Integration

#### Flow
```
User types in search input
    ↓
SearchContext updates query signal
    ↓
URL parameter synced (?q=)
    ↓
createResource fetches results
    ↓
SearchResults displays results
    ↓
User selects a result
    ↓
SearchContext.selectLocation() does:
  1. Call MapContext.flyTo()
  2. Call MapContext.addMarker()
  3. Call PlaceContext.selectPlace()
  4. navigate() to /place/:id
    ↓
Place page renders
    ↓
PlaceDetail shows information
```

#### Code Example
```javascript
// In SearchContext
const selectLocation = (feature) => {
  const [lon, lat] = feature.geometry.coordinates;
  
  // Map integration
  flyTo({ lat, lon });
  addMarker({ lat, lon });
  
  // Place integration
  const placeId = selectPlace({
    name: props.name,
    latitude: lat,
    longitude: lon,
    // ... more properties
  });
  
  // Navigation
  navigate(`/place/${placeId}`);
};
```

### 2. Place → Directions Integration

#### Flow
```
User on place detail page
    ↓
Clicks "Get Directions" button
    ↓
Navigate to /directions?to={placeId}
    ↓
Directions page reads URL parameter
    ↓
Looks up place from PlaceContext cache
    ↓
ItineraryContext.setDestinationPlace()
    ↓
DirectionsForm shows pre-filled destination
    ↓
User fills origin
    ↓
Clicks "Get Directions"
    ↓
ItineraryContext.planTrip()
    ↓
Routes fetched from OTP
    ↓
ItineraryList displays options
    ↓
User selects route
    ↓
MapContext.displayRoute()
    ↓
Map shows route with markers
```

#### Code Example
```javascript
// In Place page
const handleDirections = (place) => {
  navigate(`/directions?to=${params.id}`);
};

// In Directions page
onMount(() => {
  const toId = searchParams.to;
  if (toId) {
    const place = getPlaceById(toId);
    if (place) {
      setDestinationPlace(place);
      flyTo({ lat: place.latitude, lon: place.longitude });
      addMarker({ lat: place.latitude, lon: place.longitude });
    }
  }
});
```

### 3. Saved Locations Integration

#### Integration Points

**In Search Results:**
```javascript
// SearchResults filters saved locations
const matchingSavedLocations = () => {
  const locs = locations();
  const q = query();
  if (!locs || q.length < 2) return [];
  return locs.filter(loc => 
    loc.name.toLowerCase().includes(q.toLowerCase())
  );
};

// Display in separate section
<Show when={matchingSavedLocations().length > 0}>
  <span>Saved Places</span>
  <For each={matchingSavedLocations()}>
    {(loc) => <LocationItem ... />}
  </For>
</Show>
```

**In Directions Form:**
```javascript
// Shows saved locations in dropdowns
const originSavedMatches = () => 
  getMatchingSavedLocations(originQuery());

// Dropdown displays saved locations first
<div class="dropdown">
  <Show when={originSavedMatches().length > 0}>
    <div>Saved</div>
    <For each={originSavedMatches()}>
      {(loc) => (
        <button onClick={() => 
          selectSavedLocation(loc, setOriginPlace, ...)
        }>
          {loc.name}
        </button>
      )}
    </For>
  </Show>
  
  {/* Then search results */}
</div>
```

**In Location List (Home):**
```javascript
// Click navigates to place page
const goToLocation = (location) => {
  navigate("/place/" + location.id);
  flyTo({ lat: location.latitude, lon: location.longitude });
  addMarker({ lat: location.latitude, lon: location.longitude });
  selectPlace({
    name: location.name,
    latitude: location.latitude,
    longitude: location.longitude,
    type: "saved",
  });
};
```

### 4. Map Updates Across Features

#### Centralized Map Control
All features interact with map through MapContext API:

```javascript
// Search - centers and adds marker
flyTo({ lat, lon });
addMarker({ lat, lon });

// Place - centers on place
flyTo({ lat, lon });
addMarker({ lat, lon });

// Directions - displays route
displayRoute(itinerary);

// Location list - centers on location
flyTo({ lat, lon }, 16);
addMarker({ lat, lon });
```

#### Map State Tracking
```javascript
// MapContext tracks center for search biasing
createEffect(() => {
  const center = map.getCenter();
  setMapCenter([center.lng, center.lat]);
});

// SearchContext uses center for location bias
const [results] = createResource(
  () => ({ q: searchParams.q, center: mapCenter() }),
  async (source) => {
    // ... fetch with location bias
  }
);
```

## Data Flow Diagrams

### Complete User Journey: Search to Directions

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Action                              │
└─────────────┬───────────────────────────────────────────────────┘
              │
    ┌─────────▼─────────┐
    │  Search for Place │
    └─────────┬─────────┘
              │
    ┌─────────▼─────────────────────────────────────────┐
    │  SearchContext                                     │
    │  - Query updates                                   │
    │  - URL syncs (?q=)                                 │
    │  - Resource fetches from API                       │
    │  - Results update                                  │
    └─────────┬─────────────────────────────────────────┘
              │
    ┌─────────▼─────────────────┐
    │  SearchResults displays   │
    └─────────┬─────────────────┘
              │
    ┌─────────▼────────────────────────────────────────────┐
    │  User selects result                                 │
    │                                                       │
    │  selectLocation() triggers:                          │
    │    1. MapContext.flyTo()      → Map centers         │
    │    2. MapContext.addMarker()  → Marker appears      │
    │    3. PlaceContext.selectPlace() → Cache place      │
    │    4. navigate('/place/:id')  → Route change        │
    └─────────┬────────────────────────────────────────────┘
              │
    ┌─────────▼─────────────────────────┐
    │  Place Page                        │
    │  - Loads place from cache          │
    │  - PlaceDetail displays info       │
    │  - Action buttons available        │
    └─────────┬─────────────────────────┘
              │
    ┌─────────▼───────────────────────────────────────────┐
    │  User clicks "Get Directions"                        │
    │  navigate('/directions?to={placeId}')               │
    └─────────┬───────────────────────────────────────────┘
              │
    ┌─────────▼─────────────────────────────────────────────┐
    │  Directions Page                                       │
    │  - Reads URL param                                     │
    │  - Loads place from cache                              │
    │  - ItineraryContext.setDestinationPlace()             │
    │  - DirectionsForm shows destination                    │
    └─────────┬─────────────────────────────────────────────┘
              │
    ┌─────────▼──────────────────┐
    │  User fills origin          │
    │  (search or saved location) │
    └─────────┬──────────────────┘
              │
    ┌─────────▼─────────────────────────────────────┐
    │  User clicks "Get Directions"                  │
    │                                                 │
    │  ItineraryContext.planTrip():                  │
    │    1. Validates origin/destination             │
    │    2. POST to /api/otp/plan                    │
    │    3. Receives itineraries                     │
    │    4. Updates state                            │
    └─────────┬─────────────────────────────────────┘
              │
    ┌─────────▼──────────────────┐
    │  ItineraryList displays     │
    │  route options              │
    └─────────┬──────────────────┘
              │
    ┌─────────▼─────────────────────────────────────┐
    │  User selects route                            │
    │                                                 │
    │  MapContext.displayRoute():                    │
    │    1. clearRoute() removes old                 │
    │    2. Decode polylines                         │
    │    3. Add GeoJSON sources                      │
    │    4. Add line layers (color-coded)            │
    │    5. Add origin marker (green)                │
    │    6. Add destination marker (red)             │
    │    7. fitBounds() to show route                │
    └─────────┬─────────────────────────────────────┘
              │
    ┌─────────▼────────────┐
    │  Route visible on map │
    └───────────────────────┘
```

### Context Communication Matrix

| Context    | Reads From | Writes To | Communication Method |
|------------|------------|-----------|---------------------|
| Search     | Map, Place | Place, Router | Direct context access |
| Place      | - | - | Provides data store |
| Map        | - | - | Provides map control |
| Location   | - | - | Provides saved locations |
| Itinerary  | - | - | Provides routing state |
| Theme      | - | Map | Signal subscription |

## State Management Patterns

### 1. Signal-Based Reactivity
```javascript
// Signals for local state
const [query, setQuery] = createSignal("");

// Derived signals
const isSearchMode = () => query().length >= 3;

// Effects for side effects
createEffect(() => {
  const currentQuery = query();
  // Side effect: sync to URL
  setSearchParams({ q: currentQuery });
});
```

### 2. Resource-Based Data Fetching
```javascript
// Automatic fetching with caching
const [results] = createResource(
  () => ({ q: searchParams.q, center: mapCenter() }),
  fetchResults
);

// Display with loading/error states
<Show when={!results.loading} fallback={<Spinner />}>
  <For each={results()}>
    {item => <ResultItem {...item} />}
  </For>
</Show>
```

### 3. Context-Based Shared State
```javascript
// Provider component
export function PlaceProvider(props) {
  const [selectedPlace, setSelectedPlace] = createSignal(null);
  
  return (
    <PlaceContext.Provider value={{ selectedPlace, setSelectedPlace }}>
      {props.children}
    </PlaceContext.Provider>
  );
}

// Consumer hook
export function usePlace() {
  const context = useContext(PlaceContext);
  if (!context) throw new Error("usePlace requires PlaceProvider");
  return context;
}
```

### 4. Optimistic Updates
```javascript
// Update UI immediately, then sync with server
const deleteLocation = async (id, e) => {
  // Optimistic update
  mutate((prev) => prev.filter((loc) => loc.id !== id));
  
  // Then sync with server
  const response = await fetch(`/api/location/${id}`, {
    method: "DELETE",
  });
  
  // If failed, could revert here
};
```

## Extension Patterns

### Adding a New Feature

#### 1. Create Context (if needed)
```javascript
// src/context/NewFeatureContext.jsx
import { createContext, useContext, createSignal } from "solid-js";

const NewFeatureContext = createContext();

export function NewFeatureProvider(props) {
  const [featureState, setFeatureState] = createSignal(null);
  
  const doSomething = () => {
    // Feature logic
  };
  
  return (
    <NewFeatureContext.Provider value={{ 
      featureState, 
      doSomething 
    }}>
      {props.children}
    </NewFeatureContext.Provider>
  );
}

export function useNewFeature() {
  return useContext(NewFeatureContext);
}
```

#### 2. Add to Provider Hierarchy
```javascript
// src/index.jsx
<MapProvider>
  <NewFeatureProvider>
    <App />
  </NewFeatureProvider>
</MapProvider>
```

#### 3. Create Components
```javascript
// src/component/newfeature/FeatureComponent.jsx
import { useNewFeature } from "~/context/NewFeatureContext";
import { useMap } from "~/context/MapContext";

export default function FeatureComponent() {
  const { featureState, doSomething } = useNewFeature();
  const { flyTo } = useMap();
  
  return (
    <div>
      {/* Component UI */}
    </div>
  );
}
```

#### 4. Add Route (if needed)
```javascript
// src/App.jsx
<Router root={Layout}>
  <Route path="/newfeature" component={NewFeaturePage} />
</Router>
```

### Integrating with Existing Features

#### Using Map
```javascript
import { useMap } from "~/context/MapContext";

const { flyTo, addMarker, displayRoute } = useMap();

// Center map
flyTo({ lat: 45.5, lon: -73.5 }, 14);

// Add marker
addMarker({ lat: 45.5, lon: -73.5 });

// Display route
displayRoute(itinerary);
```

#### Using Places
```javascript
import { usePlace } from "~/context/PlaceContext";

const { selectPlace, getPlaceById } = usePlace();

// Store place
const placeId = selectPlace({
  name: "My Place",
  latitude: 45.5,
  longitude: -73.5,
  type: "custom"
});

// Retrieve later
const place = getPlaceById(placeId);
```

#### Using Search
```javascript
import { useSearch } from "~/context/SearchContext";

const { query, setQuery, results } = useSearch();

// Set search query
setQuery("restaurant");

// Access results
<For each={results()}>
  {item => <div>{item.properties.name}</div>}
</For>
```

## Best Practices

### 1. Context Organization
- **One context per feature domain**
- **Keep contexts independent when possible**
- **Document dependencies clearly**
- **Use hooks for context access**

### 2. State Management
- **Use signals for reactive state**
- **Resources for async data**
- **Derive values instead of duplicating**
- **Minimize context re-renders**

### 3. Component Structure
```
component/
  feature/
    FeatureMain.jsx       # Main component
    FeatureItem.jsx       # Item component
    FeatureForm.jsx       # Form component
    index.js              # Exports
```

### 4. Data Flow
- **Props down, events up**
- **Context for cross-cutting concerns**
- **Keep navigation logic in containers**
- **Validate data at boundaries**

### 5. Error Handling
```javascript
// In context
const [error, setError] = createSignal(null);

try {
  await apiCall();
} catch (err) {
  setError(err.message);
}

// In component
<Show when={error()}>
  <ErrorMessage message={error()} />
</Show>
```

### 6. Loading States
```javascript
// In context
const [isLoading, setIsLoading] = createSignal(false);

// In component
<Show when={!isLoading()} fallback={<Spinner />}>
  <Content />
</Show>
```

### 7. URL Integration
```javascript
// Read params
const [searchParams] = useSearchParams();
const destination = searchParams.to;

// Write params
const [, setSearchParams] = useSearchParams();
setSearchParams({ q: query }, { replace: true });
```

## Testing Integration

### Unit Tests
```javascript
// Test individual contexts
describe('PlaceContext', () => {
  it('generates deterministic IDs', () => {
    const id = generatePlaceId(45.5017, -73.5673);
    expect(id).toBe('45-501700_-73-567300');
  });
});
```

### Integration Tests
```javascript
// Test feature interactions
describe('Search to Place flow', () => {
  it('navigates to place page on selection', async () => {
    // Setup
    render(<App />);
    
    // Search
    const input = screen.getByPlaceholderText('Search places...');
    fireEvent.input(input, { target: { value: 'restaurant' } });
    
    // Wait for results
    await waitFor(() => screen.getByText('Restaurant Name'));
    
    // Select
    fireEvent.click(screen.getByText('Restaurant Name'));
    
    // Verify navigation
    expect(window.location.pathname).toMatch(/^\/place\//);
  });
});
```

### E2E Tests
```javascript
// Test complete user journeys
describe('Complete routing flow', () => {
  it('plans route from search to saved location', async () => {
    // 1. Search for place
    // 2. Save location
    // 3. Go to directions
    // 4. Select saved location as origin
    // 5. Search for destination
    // 6. Plan trip
    // 7. Verify route displayed
  });
});
```

## Performance Considerations

### 1. Minimize Context Providers
- Only create context when state is shared
- Avoid wrapping in unnecessary providers
- Use local signals when possible

### 2. Optimize Re-renders
```javascript
// Derive instead of duplicate
const isSearchMode = () => query().length >= 3;

// Not this
const [isSearchMode, setIsSearchMode] = createSignal(false);
createEffect(() => setIsSearchMode(query().length >= 3));
```

### 3. Lazy Load Features
```javascript
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Show when={shouldShow()}>
  <Suspense fallback={<Spinner />}>
    <HeavyComponent />
  </Suspense>
</Show>
```

### 4. Debounce API Calls
```javascript
// Debounce search
createEffect(() => {
  const q = query();
  const timeoutID = setTimeout(() => {
    // API call
  }, 300);
  onCleanup(() => clearTimeout(timeoutID));
});
```

### 5. Cache API Results
```javascript
// Resource provides automatic caching
const [results] = createResource(queryKey, fetchResults);

// Manual cache
const cache = new Map();
const getCached = (key) => {
  if (cache.has(key)) return cache.get(key);
  const value = fetchData(key);
  cache.set(key, value);
  return value;
};
```

## Common Patterns Cheatsheet

### Navigate with State
```javascript
// Store in context first
const placeId = selectPlace(placeData);
// Then navigate
navigate(`/place/${placeId}`);
```

### Multi-Context Operations
```javascript
// Use multiple contexts in sequence
const handleSelect = (item) => {
  flyTo({ lat, lon });           // MapContext
  addMarker({ lat, lon });       // MapContext
  const id = selectPlace(place); // PlaceContext
  navigate(`/place/${id}`);      // Router
};
```

### Conditional Rendering
```javascript
// Loading state
<Show when={!loading()} fallback={<Spinner />}>
  <Content />
</Show>

// Error state
<Show when={!error()} fallback={<Error message={error()} />}>
  <Content />
</Show>

// Empty state
<Show when={items().length > 0} fallback={<EmptyState />}>
  <For each={items()}>{item => <Item {...item} />}</For>
</Show>
```

### Form Submission
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);
  
  try {
    await apiCall();
    // Success actions
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

## Troubleshooting

### Context Not Available
```
Error: usePlace must be used within a PlaceProvider
```
**Solution**: Ensure component is wrapped in provider hierarchy

### Stale Data
**Symptom**: UI not updating when state changes
**Solution**: Verify using signals correctly, not plain variables

### Memory Leaks
**Symptom**: Performance degrades over time
**Solution**: 
- Clean up event listeners with `onCleanup()`
- Remove markers/layers when done
- Clear timeouts in effects

### Infinite Loops
**Symptom**: Application freezes
**Solution**:
- Check for circular dependencies in effects
- Use proper effect dependencies
- Avoid setting state in render functions

## Summary

The UI integration follows these principles:

1. **Context-based Architecture**: Each feature has its own context
2. **Unidirectional Data Flow**: Props down, events up
3. **Map as Central Hub**: All location features interact with map
4. **Place as Data Store**: Place context caches location data
5. **URL Integration**: Deep linking and state in URL
6. **Reactive Updates**: Signals and resources for reactivity
7. **Clean Separation**: Features are loosely coupled
8. **Extensible Design**: Easy to add new features

By following these patterns and understanding the integration points, developers can extend the application while maintaining consistency and performance.
