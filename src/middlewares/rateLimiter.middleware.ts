import rateLimit from 'express-rate-limit';

import { env } from '../config/env.config';

/**
 * Rate limiting middleware.
 * Prevents brute-force attacks and API abuse.
 */
export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    errors: [],
    statusCode: 429
  }
});

/**
 * Stricter rate limiter for auth endpoints.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
    errors: [],
    statusCode: 429
  }
});
