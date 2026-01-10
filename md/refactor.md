# Refactor Guidelines

## When to create `use*` hooks/utilities
- **Cross-component state logic**: Extract to `useX` (e.g., `useSearch`, `usePlaceSelection`) when multiple components share the same derived state, effects, or side effects (fetching, debouncing, persistence).
- **Map interactions**: Wrap maplibre operations into `useMapControls` (zoom/pan/reset), `useMapLayers`, and `useGeolocation` to keep components declarative and testable.
- **Network calls**: Centralize fetch logic in `useApi`/`useLocations`/`useSearchApi`; expose status, errors, and retry. Avoid embedding fetches in UI components.
- **Side-effect bundles**: Keyboard shortcuts, ResizeObservers, and event listeners should be encapsulated in hooks (`useShortcuts`, `useResizeMeasure`) that register/unregister cleanly.
- **Caching/derived data**: For computed lists/distances, provide helpers in hooks to avoid duplicating calculations across views.

## Operations/functions organization
- **API client**: Provide a thin client module (e.g., `lib/api.ts`) with typed functions (`searchPlaces`, `listLocations`, `saveLocation`, `deleteLocation`) and consistent error mapping.
- **Map helpers**: Separate pure utilities (bounds, angles, distance) from component files; keep rendering components lean.
- **Auth/session**: Encapsulate login/logout/me calls in a single `useAuthApi`/`authClient` module; avoid scattering cookie handling.
- **Error handling**: Standardize a small error shape and surface it via hooks/components (banner/toast). No silent failures.

## UI layout/order enhancements
- **Consistent control placement**: Ensure map controls, tray, and global buttons (locate, logout) have clear z-index ordering: map > overlays > tray > popovers.
- **Mobile tray**: Stabilize open-height by storing last measured value; debounce ResizeObserver updates to avoid flicker. Snap points should be recomputed when header changes.
- **Search UX**: Add loading/error states to search results; debounce input; keep locate button consistently visible on mobile.
- **Auth affordances**: Show signed-in state and a clear logout control in mobile header/footer; gate location list UI when unauthenticated.
- **Spacing/sections**: Group related actions (theme, shortcuts, locate) together; align padding/margins between header, content, and footer across breakpoints.
- **Empty/error states**: Provide explicit empty, error, and offline states for lists and map errors instead of silent blanks.
- **Docs/onboarding**: Add minimal README per app with install/run/env instructions; document env vars for backend search/OAuth.

## When to refactor
- Duplicate logic appears in multiple components (search, location list, map controls).
- Adding a feature requires touching many components for shared state/effects.
- Bugs stem from lifecycle/cleanup issues (listeners, observers) that a hook could encapsulate.
- UI elements drift out of alignment between mobile/desktop views or controls overlap.
- Error handling or loading states are inconsistent across features.
