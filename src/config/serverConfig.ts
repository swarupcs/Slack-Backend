import dotenv from 'dotenv';

dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const optionalEnv = (key: string, fallback: string): string =>
  process.env[key] ?? fallback;

// ─── Server ───────────────────────────────────────────────────────────────────
export const PORT = optionalEnv('PORT', '3000');
export const NODE_ENV = optionalEnv('NODE_ENV', 'development');

// ─── Database ─────────────────────────────────────────────────────────────────
export const DEV_DB_URL = optionalEnv('DEV_DB_URL', '');
export const PROD_DB_URL = optionalEnv('PROD_DB_URL', '');

// ─── JWT ──────────────────────────────────────────────────────────────────────
export const JWT_SECRET = requireEnv('JWT_SECRET');
export const JWT_EXPIRY = optionalEnv('JWT_EXPIRY', '1d');

// ─── Mail ─────────────────────────────────────────────────────────────────────
export const MAIL_ID = optionalEnv('MAIL_ID', '');
export const MAIL_PASSWORD = optionalEnv('MAIL_PASSWORD', '');

// ─── Redis ────────────────────────────────────────────────────────────────────
export const REDIS_PORT = parseInt(optionalEnv('REDIS_PORT', '6379'), 10);
export const REDIS_HOST = optionalEnv('REDIS_HOST', 'localhost');
export const REDIS_PASSWORD = optionalEnv('REDIS_PASSWORD', '');

// ─── App ──────────────────────────────────────────────────────────────────────
export const APP_LINK = optionalEnv('APP_LINK', 'http://localhost:3000');
export const ENABLE_EMAIL_VERIFICATION =
  optionalEnv('ENABLE_EMAIL_VERIFICATION', 'false') === 'true';

// ─── ImageKit ─────────────────────────────────────────────────────────────────
export const IMAGEKIT_PUBLIC_KEY = optionalEnv('IMAGEKIT_PUBLIC_KEY', '');
export const IMAGEKIT_PRIVATE_KEY = optionalEnv('IMAGEKIT_PRIVATE_KEY', '');
export const IMAGEKIT_URL_ENDPOINT = optionalEnv('IMAGEKIT_URL_ENDPOINT', '');
