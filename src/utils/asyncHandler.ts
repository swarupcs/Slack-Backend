import { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Wraps an async Express route handler so that any rejected promise is
 * forwarded to Express's `next(error)` — picked up by globalErrorHandler.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (
  requestHandler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};

export { asyncHandler };
