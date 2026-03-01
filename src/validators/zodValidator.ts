import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodSchema, ZodError } from 'zod';

import { ApiError } from '../utils/ApiError';

/**
 * Express middleware factory that validates `req.body` against a Zod schema.
 *
 * On failure → throws ApiError(400) with an array of field-level messages,
 * which the globalErrorHandler serialises uniformly.
 *
 * On success → mutates `req.body` with the parsed (coerced) value and calls next().
 */
export const validate =
  (schema: ZodSchema) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map(
          (issue) => `${issue.path.join('.') || 'field'}: ${issue.message}`
        );
        next(
          new ApiError(StatusCodes.BAD_REQUEST, 'Validation failed', messages)
        );
        return;
      }
      next(error);
    }
  };
