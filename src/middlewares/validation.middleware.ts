import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError, type ZodSchema } from 'zod';

import { ApiError } from '../utils/ApiError';

/**
 * Validation targets in the request object.
 */
type ValidationTarget = 'body' | 'params' | 'query';

/**
 * Request validation middleware factory using Zod schemas.
 *
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate (default: 'body')
 *
 * @example
 * ```ts
 * router.post('/users', validate(userSignUpSchema), createUser);
 * router.get('/users/:id', validate(idParamSchema, 'params'), getUser);
 * ```
 */
export const validate = (
  schema: ZodSchema,
  target: ValidationTarget = 'body'
) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[target]);
      // Replace with parsed (sanitized) data
      req[target] = parsed;
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`
        );
        next(
          new ApiError(
            StatusCodes.UNPROCESSABLE_ENTITY,
            'Validation failed',
            errors
          )
        );
        return;
      }
      next(error);
    }
  };
};
