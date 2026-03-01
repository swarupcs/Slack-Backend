import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import userRepository from '../repositories/userRepository';
import { ApiError } from '../utils/ApiError';
import { verifyJWT } from '../utils/common/authUtils';

/**
 * Authentication middleware.
 *
 * Token resolution order:
 *  1. `x-access-token` header  (API / mobile clients)
 *  2. `token` cookie           (browser clients with cookie auth)
 *
 * On success → attaches `req.user` (user ID string) and calls next().
 * On failure → forwards an ApiError to globalErrorHandler via next(err).
 */
export const isAuthenticated = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token =
      (req.headers['x-access-token'] as string | undefined) ??
      (req.cookies as Record<string, string | undefined>)['token'];

    if (!token) {
      return next(
        new ApiError(StatusCodes.UNAUTHORIZED, 'No auth token provided')
      );
    }

    const decoded = verifyJWT(token);

    const user = await userRepository.getById(decoded.id);
    if (!user) {
      return next(
        new ApiError(StatusCodes.UNAUTHORIZED, 'User not found')
      );
    }

    req.user = user.id as string;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Auth token has expired'));
    }
    if (error instanceof JsonWebTokenError) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid auth token'));
    }
    next(error);
  }
};
