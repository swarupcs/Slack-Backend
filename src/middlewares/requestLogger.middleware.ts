import type { NextFunction, Request, Response } from 'express';

import { logger } from '../lib/logger';

/**
 * HTTP request logging middleware.
 * Logs method, URL, status code, and response time.
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 500) {
      logger.error(logMessage);
    } else if (res.statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      if (logger.http) {
        logger.http(logMessage);
      } else {
        logger.info(logMessage);
      }
    }
  });

  next();
};
