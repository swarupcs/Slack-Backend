import type { NextFunction, Request, Response } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

/**
 * Higher-order function that wraps async route handlers
 * to automatically catch errors and forward them to the
 * global error handling middleware.
 *
 * Eliminates repetitive try-catch blocks in every controller.
 *
 * @example
 * ```ts
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await userService.getAll();
 *   res.json(new ApiResponse(200, users, 'Users fetched'));
 * }));
 * ```
 */
export const asyncHandler = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
