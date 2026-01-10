# Backend Code Review

## Overview
- Bun + Hono API with SQLite (drizzle) for users and saved locations.
- Google OAuth for auth; sessions via custom signed cookie (`auth_session`).
- Routes: `/login`, `/auth/callback`, `/me`, `/email`, `/logout`, `/status`, and `/api` (search, save/delete/list locations).

## Strengths
- Simple middleware to verify session and attach `userId`/`userEmail` to context; auto-creates user on first request.
- Drizzle schema is small and clear; location CRUD scoped to authenticated user.
- CORS configured with env-based frontend URL; credentials enabled.

## Issues / Risks
- Custom session signing uses Bun password hash with shared `JWT_SECRET`; no rotation, no iat, and base64 payload without HMAC: tamper detection relies solely on hashing secret concatenation.
- OAuth error handling is minimal: failures or missing fields return generic text/500; no logging.
- `/api/search` proxies to `http://0.0.0.0:5000/api` with fixed bbox and no timeout/validation; upstream failure returns 500 with generic message.
- `CLIENT_SECRET`, `JWT_SECRET` are required but absence isn’t validated at startup.
- Deleting location doesn’t check affected row count; always returns success even if not found.
- No rate limiting or brute-force protection on login endpoints; allowed emails check is case-sensitive.
- Uses plain HTTP when `isProd` is false; cookie secure flag off in dev (expected) but domain for delete uses `COOKIE_DOMAIN` which may be undefined.

## Suggestions
- Replace custom session with signed JWT or Hono session middleware using HMAC; include `iat`/`exp` validation and rotate keys.
- Validate required env vars at startup; fail fast with clear messages.
- Add timeouts and error mapping for the search proxy; sanitize query/lat/lon; consider upstream URL config.
- In delete location, return 404 when no row is deleted; validate `id` is integer; guard against malformed input.
- Log OAuth/token errors with context (status, body) but avoid leaking secrets.
- Consider adding simple rate limiting on auth endpoints (e.g., per-IP sliding window).
