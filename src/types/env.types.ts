import { z } from 'zod';

/**
 * Zod schema for environment variable validation.
 * Application will fail fast on startup if required variables are missing.
 */
export const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // Database
  DEV_DB_URL: z.string().url().optional(),
  PROD_DB_URL: z.string().url().optional(),

  // JWT
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRY: z.string().default('1d'),

  // Mail
  MAIL_ID: z.string().email().optional(),
  MAIL_PASSWORD: z.string().optional(),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // App
  APP_LINK: z.string().url().default('http://localhost:3000'),
  ENABLE_EMAIL_VERIFICATION: z
    .enum(['true', 'false'])
    .default('false'),

  // Image Upload Provider
  IMAGE_UPLOAD_PROVIDER: z
    .enum(['imagekit', 's3'])
    .default('imagekit'),

  // AWS
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_BUCKET_NAME: z.string().optional(),

  // ImageKit
  IMAGEKIT_PUBLIC_KEY: z.string().optional(),
  IMAGEKIT_PRIVATE_KEY: z.string().optional(),
  IMAGEKIT_URL_ENDPOINT: z.string().url().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),

  // CORS
  CORS_ORIGIN: z.string().default('*')
});

export type EnvConfig = z.infer<typeof envSchema>;
