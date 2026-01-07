export const isProd = process.env.NODE_ENV === "production";

export const JWT_SECRET = process.env.JWT_SECRET;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const CLIENT_ID = process.env.CLIENT_ID;

export const COOKIE_DOMAIN = isProd
? process.env.PROD_COOKIE_DOMAIN
: process.env.DEV_COOKIE_DOMAIN;
export const FRONTEND_URL = isProd
? process.env.PROD_FRONTEND_URL
: process.env.DEV_FRONTEND_URL;
export const REDIRECT_URI = isProd
? process.env.PROD_REDIRECT_URI
: process.env.DEV_REDIRECT_URI;

export const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS?.split(",") || [];
