import mongoose from 'mongoose';

import { logger } from '../lib/logger';
import { env } from './env.config';

/**
 * Connect to MongoDB based on the current environment.
 */
export async function connectDB(): Promise<void> {
  const dbUrl =
    env.NODE_ENV === 'production' ? env.PROD_DB_URL : env.DEV_DB_URL;

  if (!dbUrl) {
    logger.error(
      `❌ Database URL not configured for ${env.NODE_ENV} environment`
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(dbUrl);
    logger.info(
      `✅ Connected to MongoDB database [${env.NODE_ENV} environment]`
    );
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

/**
 * Gracefully disconnect from MongoDB.
 */
export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('🔌 Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
  }
}
