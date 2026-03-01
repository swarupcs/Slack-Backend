import { NextFunction, Request, Response } from 'express';

import { ApiError } from '../utils/ApiError';

/**
 * Global Express error handler.
 * Must be registered LAST in the middleware chain (after all routes).
 *
 * Handles two cases:
 *  1. ApiError  — intentional, structured errors thrown in services/controllers
 *  2. Everything else — unexpected errors (bugs, DB timeouts, etc.)
 *
 * Never exposes raw stack traces or internal details to the client.
 */
export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // ── Known structured error ────────────────────────────────────────────────
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
      data: null
    });
    return;
  }

  // ── Mongoose validation error ─────────────────────────────────────────────
  const mongoErr = err as { name?: string; errors?: Record<string, { message: string }>; code?: number };
  if (mongoErr.name === 'ValidationError' && mongoErr.errors) {
    const messages = Object.values(mongoErr.errors).map((e) => e.message);
    res.status(422).json({
      success: false,
      statusCode: 422,
      message: 'Validation failed',
      errors: messages,
      data: null
    });
    return;
  }

  // ── MongoDB duplicate key ──────────────────────────────────────────────────
  if (mongoErr.name === 'MongoServerError' && mongoErr.code === 11000) {
    res.status(409).json({
      success: false,
      statusCode: 409,
      message: 'Duplicate entry — a record with this value already exists',
      errors: [],
      data: null
    });
    return;
  }

  // ── JWT errors ────────────────────────────────────────────────────────────
  const jwtErr = err as { name?: string };
  if (jwtErr.name === 'JsonWebTokenError' || jwtErr.name === 'TokenExpiredError') {
    const message =
      jwtErr.name === 'TokenExpiredError'
        ? 'Auth token has expired'
        : 'Invalid auth token';
    res.status(401).json({
      success: false,
      statusCode: 401,
      message,
      errors: [],
      data: null
    });
    return;
  }

  // ── Unexpected / unhandled error ──────────────────────────────────────────
  console.error('[GlobalErrorHandler] Unexpected error:', err);

  res.status(500).json({
    success: false,
    statusCode: 500,
    message: 'Internal Server Error',
    errors: [],
    data: null
  });
};
