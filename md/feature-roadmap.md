# Feature Ideas and Delivery Roadmap

## Goals
- Strengthen core map/search experience, make saved places reliable, and improve sharing/collaboration.
- Reduce friction by adding clear feedback (errors/loading) and progressive enhancement on both desktop and mobile.

## Feature Backlog
- **Search UX polish**: real input debounce; loading and error banners; keyboard shortcut hints inline.
- **Place details**: richer panel (photos, hours, tags), deep-linkable `/place/:id` with backend fetch.
- **Saved places 2.0**: folders/tags, sort/filter, optimistic updates with retry and toast feedback.
- **Location sharing**: shareable links with optional expiration; copy-to-clipboard and QR for mobile.
- **User profile**: avatar, display name, theme preference sync; audit login state.
- **Offline/light mode**: cache last map tiles and recent searches; lightweight style for low-data users.
- **Collaboration**: invite-only shared lists, presence indicator, comments on places.
- **Geolocation UX**: graceful handling of denials/timeouts with CTA to enable permissions.
- **Accessibility**: focus rings, reduced-motion mode, keyboard-first navigation for lists and map controls.
- **Analytics/telemetry (privacy-safe)**: feature usage events, performance traces, search success metrics.

## Roadmap (suggested sequencing)
1. **Stability & feedback (Week 1)**
   - Add loading/error UI for search and saved places.
   - Fix delete/save optimistic flows with retries; prevent accidental navigation.
   - Implement real search debounce and guard map/search coupling.
2. **Place depth & routing (Week 2)**
   - Build `/place/:id` data fetch + detail view; enable deep links from list/search.
   - Add richer metadata display and marker persistence.
3. **Saved places enhancements (Week 3)**
   - Folders/tags + sort/filter; bulk delete.
   - Toasts for create/delete failures and successes.
4. **Sharing & profiles (Week 4)**
   - Shareable links with optional expiry; copy/QR.
   - Profile screen with editable name/avatar; sync theme to backend.
5. **Collaboration & offline (Week 5+)**
   - Invite-only shared lists with presence.
   - Cache last map tiles and recent searches; reduced-data theme.
6. **Quality pass (ongoing)**
   - Accessibility sweep, keyboard coverage, reduced motion.
   - Add telemetry hooks and dashboards; define SLIs (search latency, success rate, save failure rate).

## Success Metrics
- Search: p95 latency < 400ms (once map center available); non-zero result rate; error rate < 1%.
- Saved places: create/delete success rate > 99%; sync latency < 1s.
- Engagement: repeat sessions/week, saved places per user, share link opens.
- Quality: zero console errors in happy path; keyboard navigation parity with mouse.
