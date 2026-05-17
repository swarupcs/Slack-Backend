import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ApiError } from '../utils/ApiError';

/**
 * Catch-all middleware for undefined routes.
 * Must be registered after all route definitions.
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(
    new ApiError(
      StatusCodes.NOT_FOUND,
      `Route not found: ${req.method} ${req.originalUrl}`
    )
  );
};
