import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { verifyJWT } from '../helpers/jwt.helper';
import { logger } from '../lib/logger';
import userRepository from '../repositories/user.repository';
import type { AuthenticatedRequest } from '../types/express.types';
import { ApiError } from '../utils/ApiError';

/**
 * Authentication middleware.
 * Verifies JWT token from `x-access-token` header and
 * attaches the user ID to `req.user`.
 */
export const isAuthenticated = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers['x-access-token'] as string | undefined;

    if (!token) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Authentication required. No token provided.'
      );
    }

    const decoded = verifyJWT(token);

    const user = await userRepository.getById(decoded.id);
    if (!user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'User associated with this token no longer exists.'
      );
    }

    (req as AuthenticatedRequest).user = user.id as string;
    next();
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    const err = error as { name?: string };
    if (
      err.name === 'JsonWebTokenError' ||
      err.name === 'TokenExpiredError'
    ) {
      next(
        new ApiError(
          StatusCodes.UNAUTHORIZED,
          'Invalid or expired authentication token.'
        )
      );
      return;
    }

    logger.error('Authentication middleware error:', error);
    next(
      new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Authentication failed.'
      )
    );
  }
};
