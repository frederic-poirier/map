export const isProd = process.env.NODE_ENV === "production";
export const COOKIE_DOMAIN = isProd ? "frederic.dog" : "localhost";
export const FRONTEND_URL = isProd
    ? "https://map.frederic.dog"
    : "http://localhost:3001";
export const REDIRECT_URI = isProd
    ? process.env.PROD_REDIRECT_URI
    : "http://localhost:3000/auth/callback";
export const JWT_SECRET = process.env.JWT_SECRET;
export const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS?.split(",") || [];
export const CLIENT_ID = process.env.CLIENT_ID;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
