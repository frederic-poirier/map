# Authentication Flow Documentation

## Overview

This application uses Google OAuth 2.0 for authentication with a dual-token strategy (JWT + refresh tokens). The authentication system ensures secure access through email whitelisting and implements automatic session refresh to provide a seamless user experience.

## Architecture Components

### Frontend Components
- **Login Page** (`src/pages/Login.jsx`) - Entry point for authentication
- **Auth Callback Page** (`src/pages/Auth.jsx`) - Handles OAuth callback
- **AuthGate Component** (`src/components/AuthGate.jsx`) - Route protection and session timeout warnings
- **Auth Hook** (`src/hooks/useAuth.js`) - Authentication state management

### Backend Functions (Cloudflare Workers)
- **OAuth Start** (`functions/auth/google/start.js`) - Initiates Google OAuth flow
- **OAuth Callback** (`functions/auth/google/callback.js`) - Processes OAuth callback
- **JWT Utilities** (`functions/jwt.js`) - Token signing and verification
- **Me Endpoint** (`functions/api/me.js`) - Current user verification
- **Refresh Endpoint** (`functions/api/refresh.js`) - Token refresh
- **Logout Endpoint** (`functions/api/logout.js`) - Session termination

### Database (D1)
- **users table** - Stores user information
- **refresh_tokens table** - Stores refresh tokens with expiry and revocation status

## Authentication Flow

### 1. Login Initiation

**Entry Point:** User visits the application and is redirected to `/login` if not authenticated.

**User Action:** Clicks "Continuer avec Google" button in Login.jsx

```javascript
// Login.jsx:4
function loginwithgoogle() {
  window.location.href = "/auth/google/start";
}
```

### 2. OAuth Start (`/auth/google/start`)

**File:** `functions/auth/google/start.js`

**Process:**
1. Generate a random state UUID to prevent CSRF attacks
2. Construct Google OAuth URL with required parameters:
   - `client_id` - Google OAuth client ID
   - `redirect_uri` - Callback URL registered with Google
   - `response_type=code` - Authorization code flow
   - `scope=openid email profile` - Requested permissions
   - `state` - CSRF protection
3. Set `oauth_state` cookie (HttpOnly, SameSite=Lax, 5 minute expiry)
4. Redirect user to Google's consent page

**Security Features:**
- State parameter for CSRF protection
- HttpOnly cookie to prevent XSS access
- Limited 5-minute window for OAuth completion

**Code Reference:** `functions/auth/google/start.js:2-22`

### 3. Google Authorization

User authenticates with Google on Google's servers and grants permissions to the application.

### 4. OAuth Callback (`/auth/google/callback`)

**File:** `functions/auth/google/callback.js`

**Process:**

#### Step 4.1: Environment Validation
The callback first verifies all required environment variables are present:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `JWT_SECRET`
- `WHITELIST_EMAILS`
- `FRONTEND_ORIGIN`

**Code Reference:** `functions/auth/google/callback.js:35-52`

#### Step 4.2: State Validation
1. Extract `code` and `state` from URL query parameters
2. Parse cookies to get `oauth_state`
3. Validate that:
   - State parameter exists in URL
   - `oauth_state` cookie exists
   - URL state matches cookie state (CSRF protection)

**Code Reference:** `functions/auth/google/callback.js:54-73`

#### Step 4.3: Token Exchange
Exchange the authorization code for Google tokens:

```javascript
// functions/auth/google/callback.js:76-86
const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
  }),
});
```

**Code Reference:** `functions/auth/google/callback.js:75-99`

#### Step 4.4: ID Token Verification
Extract and validate the ID token from Google's response:

1. **Decode the JWT:**
   - Split token into 3 parts (header, payload, signature)
   - Base64URL decode the payload

2. **Validate token claims:**
   - **Audience (aud):** Must match `GOOGLE_CLIENT_ID`
   - **Issuer (iss):** Must be `https://accounts.google.com` or `accounts.google.com`
   - **Expiration (exp):** Token must not be expired
   - **Email:** Must be present in payload

**Code Reference:** `functions/auth/google/callback.js:106-143`

#### Step 4.5: Email Whitelist Check
Validate that the user's email is authorized:

```javascript
// functions/auth/google/callback.js:145-154
const whitelist = env.WHITELIST_EMAILS.split(",").map((e) => e.trim());

if (!whitelist.includes(email)) {
  return new Response("Forbidden", { status: 403 });
}
```

**Environment Variable Example:**
```toml
# wrangler.toml
[vars]
WHITELIST_EMAILS = "fredmpoirier@gmail.com,frederic8242@gmail.com,emeryseheb@gmail.com"
```

**Code Reference:** `functions/auth/google/callback.js:145-154`

#### Step 4.6: User Upsert in Database
Store or update user information in the D1 database:

```sql
-- functions/auth/google/callback.js:161-168
INSERT INTO users (email, name, picture, updated_at)
VALUES (?, ?, ?, datetime('now'))
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  picture = excluded.picture,
  updated_at = datetime('now')
```

This ensures:
- New users are created
- Existing users have their name and picture updated from Google

**Code Reference:** `functions/auth/google/callback.js:157-181`

#### Step 4.7: Refresh Token Generation
Create a long-lived refresh token for session persistence:

```javascript
// functions/auth/google/callback.js:184-190
const refreshToken = crypto.randomUUID();
const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

await env.DB.prepare(`
  INSERT INTO refresh_tokens (token, user_id, expires_at)
  VALUES (?, ?, ?)
`).bind(refreshToken, userId, refreshExpiresAt).run();
```

**Refresh Token Properties:**
- 7-day expiry
- Stored in D1 database
- Can be revoked (sets `revoked_at` timestamp)
- One-to-many relationship with users (user can have multiple active sessions)

**Code Reference:** `functions/auth/google/callback.js:183-192`

#### Step 4.8: Access Token Generation
Generate a short-lived JWT for API authentication:

```javascript
// functions/jwt.js:6-12
export async function signJwt(payload, secret) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(encoder.encode(secret));
}
```

**JWT Payload:**
```javascript
{
  sub: email,      // Subject (user identifier)
  email: email,    // User email
  userId: userId   // Database user ID
}
```

**JWT Properties:**
- Algorithm: HS256
- Expiration: 15 minutes
- Signed with `JWT_SECRET`

**Code Reference:** `functions/auth/google/callback.js:194-196`

#### Step 4.9: Cookie Setting
Set authentication cookies and redirect:

```javascript
// functions/auth/google/callback.js:198-202
headers.append("Set-Cookie", `auth_token=${jwt}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=900`);
headers.append("Set-Cookie", `refresh_token=${refreshToken}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=604800`);
headers.append("Set-Cookie", `oauth_state=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`);
```

**Cookies:**
1. **auth_token:** JWT (15 minute expiry, 900 seconds)
2. **refresh_token:** Long-lived token (7 days, 604800 seconds)
3. **oauth_state:** Cleared (Max-Age=0)

**Security Features:**
- HttpOnly: Prevents JavaScript access
- SameSite=Lax: CSRF protection
- Secure: HTTPS only
- Path=/: Available on all routes

**Code Reference:** `functions/auth/google/callback.js:198-208`

### 5. Callback Page (`/callback`)

**File:** `src/pages/Auth.jsx`

**Process:**
1. Call `/api/me` to verify authentication
2. If authenticated, redirect to home (`/`)
3. If not authenticated, redirect to login (`/login`)
4. Display loading/verification status during process

**Code Reference:** `src/pages/Auth.jsx:12-36`

### 6. Session Verification (`/api/me`)

**File:** `functions/api/me.js`

**Process:**
1. Extract `auth_token` from cookies
2. Verify JWT using `JWT_SECRET`
3. Return user information and expiry time

**Response (Authenticated):**
```json
{
  "authenticated": true,
  "userId": "user@example.com",
  "email": "user@example.com",
  "expiresAt": 1737484800000
}
```

**Response (Not Authenticated):**
```json
{
  "authenticated": false,
  "error": "error message"
}
```

**Code Reference:** `functions/api/me.js:20-60`

### 7. Auth State Management (Frontend)

**File:** `src/hooks/useAuth.js`

**State:**
```javascript
{
  loading: boolean,    // Initial auth check in progress
  user: object|null,   // User data if authenticated
  expiresAt: number|null  // JWT expiry timestamp
}
```

#### Initialization
1. Call `/api/me` on application mount
2. Set auth state based on response
3. Start refresh timer if authenticated

**Code Reference:** `src/hooks/useAuth.js:12-46`

#### Automatic Refresh Strategy
The `useAuth` hook implements intelligent token refreshing:

**Refresh Timer:**
- Checks every 30 seconds
- Refreshes when token expires in less than 2 minutes

```javascript
// src/hooks/useAuth.js:75-93
if (timeUntilExpiry < 2 * 60 * 1000) {
  refreshSession();
}
```

**Tab Visibility Handler:**
- Re-validates session when tab becomes visible
- Ensures token hasn't expired while tab was in background

**Code Reference:** `src/hooks/useAuth.js:95-101`

#### Manual Refresh Function

```javascript
// src/hooks/useAuth.js:48-73
export async function refreshSession() {
  const res = await fetch("/api/refresh", {
    method: "POST",
    credentials: "include",
  });

  if (res.ok) {
    await initAuth(); // Reload user data
  }
}
```

**Code Reference:** `src/hooks/useAuth.js:48-73`

### 8. Token Refresh (`/api/refresh`)

**File:** `functions/api/refresh.js`

**Process:**

#### Step 8.1: Refresh Token Validation
1. Extract `refresh_token` from cookies
2. Query database for token with user details
3. Validate that:
   - Token exists
   - Token is not revoked (`revoked_at` is NULL)
   - Token is not expired (`expires_at` > current time)

```sql
-- functions/api/refresh.js:39-44
SELECT rt.id, rt.user_id, rt.expires_at, rt.revoked_at, u.email, u.name, u.picture
FROM refresh_tokens rt
JOIN users u ON u.id = rt.user_id
WHERE rt.token = ?
```

**Code Reference:** `functions/api/refresh.js:38-59`

#### Step 8.2: New JWT Generation
Generate a fresh JWT with updated expiry:

```javascript
// functions/api/refresh.js:64-68
const newJwt = await signJwt(
  { sub: tokenResult.email, email: tokenResult.email, userId: tokenResult.user_id },
  env.JWT_SECRET
);
```

**Code Reference:** `functions/api/refresh.js:63-69`

#### Step 8.3: Cookie Update
Set new `auth_token` cookie:

```javascript
// functions/api/refresh.js:75-78
response.headers.append(
  "Set-Cookie",
  `auth_token=${newJwt}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=900`
);
```

**Code Reference:** `functions/api/refresh.js:75-78

### 9. Route Protection (AuthGate)

**File:** `src/components/AuthGate.jsx`

**Public Paths:**
```javascript
// src/components/AuthGate.jsx:8
export const PUBLIC_PATHS = ["/login", "/callback", "/auth/google"];
```

**Protection Logic:**
1. Show loading state while checking auth
2. Redirect to `/login` if:
   - User is not authenticated
   - Current path is not in `PUBLIC_PATHS`
3. Render children if authenticated or on public path

**Code Reference:** `src/components/AuthGate.jsx:20-32`

#### Session Timeout Warning
Shows a warning banner when session expires in less than 2 minutes:

```javascript
// src/components/AuthGate.jsx:42-59
const checkTimeout = () => {
  const now = Date.now();
  const expiresAt = currentAuth.expiresAt;
  const timeLeft = expiresAt - now;

  if (timeLeft > 0 && timeLeft < 120000) { // 2 minutes
    setShowTimeoutWarning(true);
    setTimeRemaining(Math.floor(timeLeft / 1000));
  }
};
```

**Features:**
- Displays countdown in seconds
- "Rafraîchir" button to manually refresh
- Auto-refreshes automatically
- Polls every 10 seconds

**Code Reference:** `src/components/AuthGate.jsx:34-59`

### 10. Logout (`/api/logout`)

**File:** `functions/api/logout.js`

**Process:**
1. Extract `refresh_token` from cookies
2. Revoke refresh token in database:

```sql
-- functions/api/logout.js:27-31
UPDATE refresh_tokens
SET revoked_at = datetime('now')
WHERE token = ?
```

3. Clear all auth cookies:

```javascript
// functions/api/logout.js:41-42
headers.append("Set-Cookie", "auth_token=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0");
headers.append("Set-Cookie", "refresh_token=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0");
```

**Code Reference:** `functions/api/logout.js:17-48`

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

**Index:**
- `idx_users_email` - Fast email lookups

### Refresh Tokens Table

```sql
CREATE TABLE refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  revoked_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_refresh_tokens_token` - Fast token lookups
- `idx_refresh_tokens_user_id` - Fast user token lookups

**Relationship:** One user can have multiple refresh tokens (multiple devices/sessions)

## Security Features

### 1. CSRF Protection
- State parameter in OAuth flow
- SameSite=Lax on all cookies

### 2. XSS Protection
- HttpOnly cookies prevent JavaScript access
- No sensitive data in localStorage/sessionStorage

### 3. Token Security
- Short-lived JWT (15 minutes)
- Long-lived refresh tokens (7 days)
- Refresh tokens stored server-side (database)
- JWT signed with HS256 algorithm

### 4. Access Control
- Email whitelist enforcement
- 403 Forbidden for unauthorized emails

### 5. Session Management
- Automatic token refresh before expiry
- Refresh token revocation on logout
- Token expiry validation
- Cascade delete of refresh tokens on user deletion

### 6. Token Validation
- Google ID token verification (audience, issuer, expiry)
- JWT verification on every API request
- Refresh token validation (existence, revocation, expiry)

## Environment Variables

### Required Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | `GOCSPX-...` |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | `https://example.com/auth/google/callback` |
| `JWT_SECRET` | Secret for JWT signing | Random 32+ character string |
| `WHITELIST_EMAILS` | Authorized emails | `user1@example.com,user2@example.com` |
| `FRONTEND_ORIGIN` | Frontend base URL | `https://example.com` |

### Cloudflare Workers Bindings

```toml
# wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "map-auth"
database_id = "your-database-id"
```

## Token Lifetimes

| Token Type | Lifetime | Storage | Purpose |
|------------|----------|---------|---------|
| OAuth State | 5 minutes | Cookie (HttpOnly) | CSRF protection |
| Google ID Token | Variable (usually 1 hour) | Not stored | User identity verification |
| Access Token (JWT) | 15 minutes | Cookie (HttpOnly) | API authentication |
| Refresh Token | 7 days | Database + Cookie (HttpOnly) | Access token renewal |

## API Endpoints

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/auth/google/start` | GET | No | Initiate Google OAuth |
| `/auth/google/callback` | GET | No | Process OAuth callback |
| `/api/me` | GET | No | Check current auth status |
| `/api/refresh` | POST | No (refresh token) | Renew access token |
| `/api/logout` | POST | No | End session |

## Flow Diagrams

### Login Flow

```
User → Login Page → Click "Continue with Google"
    ↓
GET /auth/google/start
    ↓
Generate state + Set oauth_state cookie
    ↓
Redirect to Google OAuth
    ↓
Google: User authenticates
    ↓
Google: Redirect to /auth/google/callback?code=...&state=...
    ↓
Validate state (CSRF check)
    ↓
Exchange code for tokens with Google
    ↓
Validate Google ID token (aud, iss, exp)
    ↓
Check email against whitelist
    ↓
Upsert user in D1 database
    ↓
Generate refresh token (7 days)
    ↓
Generate JWT (15 minutes)
    ↓
Set auth_token + refresh_token cookies
    ↓
Redirect to /callback
    ↓
Call /api/me to verify
    ↓
Redirect to home (/)
```

### Token Refresh Flow

```
Timer checks JWT expiry every 30s
    ↓
JWT expires in < 2 minutes?
    ↓
POST /api/refresh
    ↓
Validate refresh token in D1:
  - Token exists
  - Not revoked
  - Not expired
    ↓
Generate new JWT (15 minutes)
    ↓
Set new auth_token cookie
    ↓
Call /api/me to reload user data
```

### Logout Flow

```
User clicks logout
    ↓
POST /api/logout
    ↓
Revoke refresh token in D1
    ↓
Clear auth_token cookie
    ↓
Clear refresh_token cookie
    ↓
Update auth state (user: null)
    ↓
Stop refresh timer
    ↓
Redirect to login
```

## Error Handling

### OAuth Errors
- Invalid state → 400 Bad Request
- Missing code → 400 Bad Request
- Google token error → 400 Bad Request
- Invalid ID token → 400 Bad Request
- Token expired → 400 Bad Request
- Forbidden email → 403 Forbidden

### API Errors
- Missing JWT → 401 Unauthorized
- Invalid JWT → 401 Unauthorized
- Expired JWT → 401 Unauthorized
- Missing refresh token → 401 Unauthorized
- Invalid refresh token → 401 Unauthorized
- Revoked refresh token → 401 Unauthorized
- Expired refresh token → 401 Unauthorized

## Monitoring and Logging

All authentication functions include console logging for debugging:

```javascript
// Example logging pattern
log("Starting callback", {
  url: request.url,
  method: request.method,
});
```

**Log Prefixes:**
- `[START]` - OAuth start
- `[AUTH]` - OAuth callback
- `[ME]` - User verification
- `[REFRESH]` - Token refresh
- `[LOGOUT]` - Session termination
- `[useAuth]` - Frontend auth state

## Best Practices Implemented

1. **Stateless JWT** - No session storage on server
2. **Server-side refresh tokens** - Prevents token theft
3. **HttpOnly cookies** - Prevents XSS token access
4. **Secure flag** - HTTPS only in production
5. **SameSite cookies** - CSRF protection
6. **Email whitelist** - Access control
7. **Automatic refresh** - Seamless user experience
8. **Revocation support** - Logout functionality
9. **Cascade deletes** - Data integrity
10. **Indexed queries** - Performance optimization

## Testing Considerations

### Manual Testing
1. Test login with whitelisted email
2. Test login with non-whitelisted email (should 403)
3. Test token expiration (wait 15 minutes)
4. Test automatic refresh (wait 13 minutes)
5. Test logout
6. Test logout token invalidation
7. Test multiple device sessions
8. Test session timeout warning

### Automated Testing Scenarios
- OAuth state mismatch
- Invalid authorization code
- Expired ID token
- Invalid refresh token
- Revoked refresh token
- Missing cookies
- Invalid JWT signature
- Token expiration edge cases

## Troubleshooting

### Common Issues

**Problem:** Login fails with "Missing env vars"
**Solution:** Check wrangler.toml and secrets are configured

**Problem:** 403 Forbidden on valid login
**Solution:** Verify email is in WHITELIST_EMAILS

**Problem:** JWT expires and doesn't refresh
**Solution:** Check refresh token exists in database and is not expired

**Problem:** OAuth state mismatch
**Solution:** Clear cookies and retry login

**Problem:** CORS errors
**Solution:** Verify FRONTEND_ORIGIN matches your domain

## File References

### Core Files
- `frontend/functions/auth/google/start.js` - OAuth initiation
- `frontend/functions/auth/google/callback.js` - OAuth processing
- `frontend/functions/jwt.js` - Token utilities
- `frontend/functions/api/me.js` - User verification
- `frontend/functions/api/refresh.js` - Token renewal
- `frontend/functions/api/logout.js` - Session termination
- `frontend/src/hooks/useAuth.js` - Auth state management
- `frontend/src/components/AuthGate.jsx` - Route protection
- `frontend/src/pages/Login.jsx` - Login page
- `frontend/src/pages/Auth.jsx` - Callback handler
- `frontend/schema.sql` - Database schema
- `frontend/wrangler.toml` - Configuration

## Conclusion

This authentication system provides a secure, user-friendly authentication experience with:
- Industry-standard OAuth 2.0 flow
- Dual-token architecture for security and convenience
- Automatic session management
- Comprehensive access control
- Robust error handling
- Clear audit logging

The system is production-ready and follows security best practices for modern web applications.
