import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

import { env } from '../config/env.config';
import { logger } from '../lib/logger';
import { ApiError } from '../utils/ApiError';

/**
 * Centralized global error handling middleware.
 *
 * Handles:
 * - ApiError (operational errors)
 * - Mongoose ValidationError
 * - Mongoose CastError (invalid ObjectId)
 * - MongoDB duplicate key error (code 11000)
 * - JWT errors
 * - Unknown/programmer errors
 */
export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error: ApiError;

  // Already an ApiError — use as-is
  if (err instanceof ApiError) {
    error = err;
  }
  // Mongoose validation error
  else if (err.name === 'ValidationError' && err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(
      StatusCodes.BAD_REQUEST,
      'Validation error',
      errors
    );
  }
  // Mongoose CastError (invalid ObjectId, etc.)
  else if (err.name === 'CastError') {
    const castErr = err as mongoose.Error.CastError;
    error = new ApiError(
      StatusCodes.BAD_REQUEST,
      `Invalid ${castErr.path}: ${String(castErr.value)}`
    );
  }
  // MongoDB duplicate key error
  else if ((err as unknown as Record<string, unknown>).code === 11000) {
    const mongoErr = err as unknown as Record<string, unknown>;
    const keyValue = mongoErr.keyValue as Record<string, unknown> | undefined;
    const field = keyValue ? Object.keys(keyValue).join(', ') : 'field';
    error = new ApiError(
      StatusCodes.CONFLICT,
      `Duplicate value for ${field}. This resource already exists.`
    );
  }
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    error = new ApiError(
      StatusCodes.UNAUTHORIZED,
      'Invalid authentication token.'
    );
  }
  else if (err.name === 'TokenExpiredError') {
    error = new ApiError(
      StatusCodes.UNAUTHORIZED,
      'Authentication token has expired.'
    );
  }
  // Unknown/programmer errors
  else {
    logger.error('Unhandled error:', err);
    error = new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'An unexpected internal error occurred.',
      [],
      false
    );
  }

  // Log server errors
  if (error.statusCode >= 500) {
    logger.error(`[${error.statusCode}] ${error.message}`, {
      stack: err.stack
    });
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors,
    statusCode: error.statusCode,
    // Only include stack trace in development
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
