import { StatusCodes } from 'http-status-codes';

import { signInService, signUpService } from '../services/user.service';
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
