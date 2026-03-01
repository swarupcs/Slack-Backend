import { Response } from 'express';

import { JWT_EXPIRY } from '../config/serverConfig';
import { NODE_ENV } from '../config/serverConfig';

// Parse JWT_EXPIRY (e.g. "7d", "1d", "2h") into milliseconds
const parseExpiryToMs = (expiry: string): number => {
  const unit = expiry.slice(-1);
  const value = parseInt(expiry.slice(0, -1), 10);
  const map: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000
  };
  return (map[unit] ?? 86_400_000) * value;
};

const COOKIE_OPTIONS = {
  httpOnly: true,                          // not accessible via JS
  secure: NODE_ENV === 'production',       // HTTPS only in prod
  sameSite: 'strict' as const,            // CSRF protection
  maxAge: parseExpiryToMs(JWT_EXPIRY)
};

/**
 * Sets the `token` cookie on the response.
 * httpOnly prevents XSS access; secure enforces HTTPS in production.
 */
export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie('token', token, COOKIE_OPTIONS);
};

/**
 * Clears the `token` cookie by setting maxAge to 0.
 */
export const clearAuthCookie = (res: Response): void => {
  res.cookie('token', '', { ...COOKIE_OPTIONS, maxAge: 0 });
};
