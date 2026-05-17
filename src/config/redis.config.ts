import type { RedisOptions } from 'ioredis';

import { env } from './env.config';

/**
 * Redis connection configuration for Bull queues and caching.
 */
export const redisConfig: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null
};
