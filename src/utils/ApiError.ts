import type { IApiErrorResponse } from '../types/api.types';

/**
 * Custom operational error for API error responses.
 * Extends native Error so it can be thrown and caught like any error,
 * while carrying structured metadata for the global error handler.
 *
 * @example
 * ```ts
 * throw new ApiError(404, 'User not found');
 * throw new ApiError(400, 'Validation failed', ['email is required']);
 * ```
 */
export class ApiError extends Error implements IApiErrorResponse {
  public readonly success = false as const;
  public readonly statusCode: number;
  public readonly errors: string[];
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message = 'Something went wrong',
    errors: string[] = [],
    isOperational = true,
    stack?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serialize for JSON response.
   */
  public toJSON(): IApiErrorResponse {
    return {
      success: false,
      message: this.message,
      errors: this.errors,
      statusCode: this.statusCode
    };
  }
}
