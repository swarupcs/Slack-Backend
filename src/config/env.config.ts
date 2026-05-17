import dotenv from 'dotenv';

import { logger } from '../lib/logger';
import type { EnvConfig } from '../types/env.types';
import { envSchema } from '../types/env.types';

// Load .env before validation
dotenv.config();

/**
 * Parse and validate environment variables at startup.
 * Application will terminate if validation fails (fail-fast).
 */
function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    logger.error('❌ Invalid environment variables:', formatted);
    process.exit(1);
  }

  return result.data;
}

/** Validated, typed environment configuration. */
export const env: EnvConfig = validateEnv();
