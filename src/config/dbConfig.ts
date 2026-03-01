import mongoose from 'mongoose';

import { DEV_DB_URL, NODE_ENV, PROD_DB_URL } from './serverConfig';

const DB_URL_MAP: Record<string, string> = {
  development: DEV_DB_URL,
  production: PROD_DB_URL
};

/**
 * Connects to MongoDB based on the current NODE_ENV.
 * Applies best-practice connection options and graceful shutdown hooks.
 */
export default async function connectDB(): Promise<void> {
  const dbUrl = DB_URL_MAP[NODE_ENV];

  if (!dbUrl) {
    throw new Error(
      `No database URL configured for environment: ${NODE_ENV}`
    );
  }

  mongoose.connection.on('connected', () => {
    console.info(`[MongoDB] Connected — env: ${NODE_ENV}`);
  });

  mongoose.connection.on('error', (err: Error) => {
    console.error('[MongoDB] Connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.info('[MongoDB] Connection closed due to app termination');
    process.exit(0);
  });

  await mongoose.connect(dbUrl, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45_000
  });
}
