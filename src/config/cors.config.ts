import type { CorsOptions } from 'cors';

import { env } from './env.config';

/**
 * CORS configuration based on environment.
 */
export const corsOptions: CorsOptions = {
  origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
