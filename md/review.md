# Frontend Code Review

- SolidJS + Vite app with responsive mobile tray UI, maplibre map, search/saved places, theme, and auth gating.
- Mobile UX uses a tray/bottom-sheet pattern; desktop uses sidebar. Context providers manage map, auth, theme, and selected place state.

## Strengths

- Clear separation of contexts (auth/map/theme/place) and components (layout, tray, search, map controls).
- Map component handles loading/error states, retries on known maplibre DataView issue, and cleans up map instance.
- Mobile tray uses scroll-snap with explicit controls and measurement for open height; solid reactivity for expansion.
- UI includes accessibility-ish touches (keyboard shortcuts, focus handling, blur on Escape).

## Issues / Risks

- Error handling in search (frontend) surfaces little detail; failures just clear loading state—no user feedback.
- Location search and saving rely on `credentials: 'include'`; but when unauthenticated the UI doesn’t surface auth errors (results silently empty or actions no-op).
- Mobile tray measurement relies on ResizeObserver; if header renders async or is conditionally hidden, open height may briefly be default (110) causing flicker.
- Map controls z-index lowered to sit under tray; ensure other overlays (toast, popovers) still appear above.
- No frontend tests and minimal README; onboarding requires digging through code.

## Suggestions

- Add user-visible error to search and location save lists (e.g., toast/banner) when backend returns 401/500.
- Gate location list rendering on auth state to avoid confusing blank lists when unauthenticated.
- Provide a small README with setup/run instructions (Vite + backend URL envs).
- Consider debouncing search input before fetch to reduce unnecessary requests.
- For tray measurement, consider defaulting to last known height and only updating when ResizeObserver reports >0 to reduce flicker.

## Quick Notes

- Dev URLs hard-coded to `http://localhost:4000` for API; ensure env override for deployments.
- Map bounds and pmtiles URL are fixed to Montreal; expose as config if multi-region is needed.
