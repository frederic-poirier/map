export const isProd = process.env.NODE_ENV === "production";

export const JWT_SECRET = process.env.JWT_SECRET;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const CLIENT_ID = process.env.CLIENT_ID;

export const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS?.split(",") || [];

export const OSM_VERSION = 0;
