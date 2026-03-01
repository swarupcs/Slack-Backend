import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from './serverConfig';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

/**
 * Shared Redis configuration used by Bull queues.
 */
const redisConfig: RedisConfig = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {})
};

export default redisConfig;
