import { StatusCodes } from 'http-status-codes';

import { signInService, signUpService, updateProfileService, updatePasswordService } from '../services/user.service';
import type { AuthenticatedRequest } from '../types/express.types';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * POST /api/v1/users/signup
 */
export const signUp = asyncHandler(async (req, res) => {
  const user = await signUpService(req.body);

  res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, user, 'User created successfully'));
});

/**
 * POST /api/v1/users/signin
 */
export const signIn = asyncHandler(async (req, res) => {
  const response = await signInService(req.body);

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, response, 'User signed in successfully'));
});

/**
 * PUT /api/v1/users/me
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user;
  const user = await updateProfileService({
    userId,
    username: req.body.username,
    avatar: req.body.avatar,
    status: req.body.status
  });

  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          status: user.status,
          email: user.email
        },
        'Profile updated successfully'
      )
    );
});

/**
 * PUT /api/v1/users/me/password
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user;
  await updatePasswordService({
    userId,
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword
  });

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, null, 'Password updated successfully'));
});
