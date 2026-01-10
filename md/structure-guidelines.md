# Frontend Structure & Data-Sharing Guidelines

## High-Level Principles
- **Single source of truth per concern**: one place for auth, one for map state, one for search query/results, etc.
- **Keep contexts narrow**: only wrap the subtree that needs the data; avoid app-wide providers unless truly global (auth, theme).
- **Prefer hooks for composition**: colocate side effects with the views that use them; expose small, focused hooks instead of monolithic contexts.
- **Avoid duplicate state**: derive UI state from existing signals/resources whenever possible.

## Proposed Folder Layout
```
src/
  app/
    App.jsx                # Router + top providers
    routes/                # Route components
  components/              # Pure UI pieces (no cross-page state)
  features/
    auth/
      AuthProvider.jsx
      useAuth.js
    theme/
      ThemeProvider.jsx
      useTheme.js
    map/
      MapProvider.jsx
      useMap.js
      MapView.jsx
      controls/
    search/
      SearchProvider.jsx   # query + results + selection
      useSearch.js
      SearchInput.jsx
      SearchResults.jsx
    place/
      PlaceProvider.jsx    # selected place details
      PlaceDetail.jsx
    saved-places/
      LocationProvider.jsx # saved list resource
      LocationList.jsx
  hooks/                   # Reusable generic hooks (useKeyboard, useMediaQuery)
  utils/                   # Pure utilities (formatting, coords)
  styles/
```

## Provider Boundaries
- **Global**: `AuthProvider`, `ThemeProvider` (wrap `App`).
- **Map-scoped**: `MapProvider` wraps only routes that render the map (e.g., `Home`, `Place`).
- **Search-scoped**: `SearchProvider` inside map routes; depends on `MapProvider` for center/marker helpers.
- **Place selection**: `PlaceProvider` inside map routes to share selected place between search results and detail panel.
- **Saved places**: `LocationProvider` wraps components that show or mutate saved lists; fetch lazily on first use.

## Data Flow Patterns
- **Resources for fetch**: use `createResource` for remote data; expose `{ data, loading, error, refetch }` to UI.
- **Derived state**: compute view-only flags (`isSearchMode`, `hasResults`) from signals/resources rather than storing twice.
- **Event APIs**: contexts expose small methods (`selectPlace`, `flyTo`, `saveLocation`) that encapsulate side effects; keep them pure where possible.
- **URL sync**: keep query string sync inside the search feature; avoid duplicating query state elsewhere. Debounce before writing to URL and before fetching.

## Composition Examples
- **Home route** wraps: `MapProvider` → `PlaceProvider` → `SearchProvider` → `LocationProvider` around its panel components; map backdrop lives alongside.
- **Place route** can reuse `MapProvider` + `PlaceProvider` to show deep-linked places; `SearchProvider` optional.
- **Profile route**: only needs `AuthProvider`/`ThemeProvider`; no map/search providers.

## State/Effect Hygiene
- Clean up all event listeners (`matchMedia`, `maplibre protocol`, keyboard) on unmount.
- Keep provider values stable: memoize objects or expose signals directly; avoid recreating functions on every render when passed deep.
- Handle errors explicitly: expose errors from resources; show toasts/banners; avoid silent failures.
- Debounce expensive effects (search fetch, resize) and gate on required inputs (map center present).

## Testing & Safety Nets
- Add linting/TS to catch missing imports/identifiers.
- Unit-test hooks (search URL sync, keyboard) and provider contracts (selected place clears, map helpers no-op safely).
- Provide storybook-style sandboxes for components where possible to validate composition without the whole app.
