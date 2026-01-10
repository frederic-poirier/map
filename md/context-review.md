# Frontend Context, Hooks, and Component Review

## Overview
- SolidJS app with multiple contexts (auth, map, search, place, location, theme) wrapped at the root (`frontend/src/component/layout/Layout.jsx`).
- Several components/pages are incomplete or stale; multiple imports/functions are missing, making current code not compile as-is.
- Contexts are broadly scoped and carry both state and imperative APIs; some misuse and missing cleanups create bugs.

## Contexts
- `AuthContext` (`frontend/src/context/AuthContext.jsx:1`): Fetches `/me` on mount and stores only `email`; no error surface, but otherwise scoped reasonably.
- `LocationContext` (`frontend/src/context/LocationContext.jsx:9`): `createResource` fetches saved locations, but `deleteLocation` optimistic mutation ignores fetch failure and never refetches; no error UI. `saveLocation` refetches but swallows backend errors.
- `MapContext` (`frontend/src/context/MapContext.jsx:6`): Stores map instance/center and exposes imperative helpers. No teardown of `maplibregl.addProtocol` or marker when map unmounts; otherwise coherent.
- `PlaceContext` (`frontend/src/context/PlaceContext.jsx:5`): `clearPlace` calls `selectPlace()` (the function) instead of `selectedPlace()`, so it never clears; state model is fine but bugged.
- `SearchContext` (`frontend/src/context/SearchContext.jsx:20`): Mixes routing, query state, fetch, selection, and UI focus in one context. Uses `setTimeout` with `DEBOUNCE_DELAY = 0`, so no real debounce; resource keys on `searchParams.q`, not `query()`, leading to duplicated state and potential desync. No loading/error exposure to UI; relies on `mapCenter()` being set, so initial renders have empty results silently.
- `ThemeContext` (`frontend/src/context/ThemeContext.jsx:5`): Persists theme and toggles `documentElement` class, but `matchMedia` listener is never removed, causing leaks on remounts.

## Hooks
- `useKeyboard` (`frontend/src/utils/useKeyboard.js:1`): Prevents shortcuts while typing, but uses `if (e.key !== Escape) document.blur();` with `Escape` undefined and blurs the whole document on most keys—undesirable side effect. No per-page unsubscription issues beyond that.
- `useCoordinates` (`frontend/src/utils/useCoordinates.js:4`): Small utility; fine.

## Components and Pages
- `Layout.jsx` (`frontend/src/component/layout/Layout.jsx:1`): Nests all providers; simple but makes contexts app-global even when only subsets are needed. No suspense/loading around nested providers.
- `LayoutContent.jsx` (`frontend/src/component/layout/LayoutContent.jsx:5`): Uses `Show`, `onMount`, `onCleanup` without importing; would not compile. Intended responsive switcher but unused.
- `DesktopLayout.jsx` (`frontend/src/component/layout/DesktopLayout.jsx:1`): Missing imports for `useTheme`, `useMap`, `usePlace`, `Show`, `Header`, `DesktopPlaceHeader`, `SearchBox`, `PlaceDetail`, `Footer`, `Map`. Stale copy; would not compile.
- `MobileLayout.jsx` (`frontend/src/component/layout/MobileLayout.jsx:1`): Missing imports for `useTheme`, `useMap`, `usePlace`, `useKeyboard`, `Tray`, `TrayCard`, `PlaceHeader`, `MobileSearchHeader`, `MobileSearchContent`, `MobileFooter`, `PlaceDetail`, and Solid primitives. Contains its own search state instead of using `SearchContext`, causing double sources of truth.
- `DesktopHeader.jsx` (`frontend/src/component/header/DesktopHeader.jsx:1`): Empty file.
- `MobileHeader.jsx` (`frontend/src/component/header/MobileHeader.jsx:1`): Imports `SearchInput` from `../search/SearchBox` (file does not exist) and `LocateMeButton` missing import—broken.
- `Map.jsx` (`frontend/src/component/Map.jsx:16`): Initializes map, handles theme-driven style updates, and cleans map instance. Leaves `maplibregl.addProtocol` registered on unmount; could leak. Map controls rely on `useMap` signals.
- `SearchInput` (`frontend/src/component/search/SearchInput.jsx:5`): Fully coupled to `SearchContext`; props are unused. Keyboard handling and focus management are good.
- `SearchResults` (`frontend/src/component/search/SearchResults.jsx:10`): Uses `useSearch`/`useMap`/`usePlace`; no loading/error display; `reset` only clears query. 
- `LocateMeButton` (`frontend/src/component/location/LocateMeButton.jsx:1`): Straightforward; no error UI for geolocation denial.
- `LocationList` (`frontend/src/component/location/LocationList.jsx:1`): Uses `useLocation` resource; delete button calls `deleteLocation` without preventing event propagation (navigates even when deleting).
- `PlaceDetail.jsx` (`frontend/src/component/place/PlaceDetail.jsx:1`): Empty placeholder.
- Pages:
  - `Home.jsx` (`frontend/src/pages/Home.jsx:1`): Calls `useKeyboard` with handlers (`toggleTheme`, `mapInstance`, `toggleFullscreen`, `clearPlace`) that are undefined in scope—runtime errors; relies on `SearchContext` query length.
  - `Search.jsx` (`frontend/src/pages/Search.jsx:1`): Placeholder.
  - `Place.jsx` (`frontend/src/pages/Place.jsx:1`): Basic route param display; no data fetch; uses `LayoutHeader` only.
  - `Profile.jsx` (`frontend/src/pages/Profile.jsx:1`): Works with `useAuth`; minimal UI.

## Architecture/Usage Observations
- Context sprawl: All providers wrap the whole app even when some screens need only a subset; increases render surface and coupling. Search and map concerns are tightly coupled via context rather than scoped hooks in relevant views.
- Multiple stale/unused layout/header components suggest divergence between intended design (desktop/mobile split) and current implementation. Keeping dead files complicates maintenance.
- Several components maintain their own state instead of reusing context (e.g., `MobileLayout` search signals) leading to potential desync with `SearchContext` consumers.
- Error handling is largely absent across contexts and components; user-facing feedback is missing for fetch failures and geolocation errors.
- Type safety is absent; many bugs (missing imports, undefined identifiers) would be caught by TS or linting.

## Recommendations (prioritized)
- Fix broken code paths and leaks:
  - Add missing imports or remove unused layout/header files; ensure `Home.jsx` keyboard handlers come from contexts (map/theme/place) or remove them.
  - Correct `PlaceContext.clearPlace` to read `selectedPlace()`; clean up `ThemeContext` media listener and `Map.jsx` protocol on unmount.
  - Guard `deleteLocation` optimistic update with error handling and `preventDefault` on delete button.
- Simplify and scope contexts:
  - Keep auth/theme global; consider scoping map/search/place to pages that use them (or memoizing provider values) to reduce rerenders.
  - Split `SearchContext` concerns: URL syncing + query, async resource + loading/error, and UI selection/focus could be smaller hooks.
- Improve hooks:
  - Fix `useKeyboard` blur bug; allow opt-in blur and ensure `Escape` is a string literal.
  - Add real debounce to search input or resource trigger; expose loading/error to UI.
- Component cleanup:
  - Remove or finish unused layout/header components; align mobile/desktop variants with actual router/layout usage.
  - Implement `PlaceDetail` or remove its consumers; add feedback states for search/location/geolocation failures.
- Testing and linting:
  - Add minimal linting/TS checks or unit tests around contexts to catch undefined identifiers and stale imports early.
