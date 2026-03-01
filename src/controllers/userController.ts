import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { signInService, signUpService } from '../services/userService';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { setAuthCookie } from '../utils/cookies';
import { SignUpInput, SignInInput } from '../types/index';

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const user = await signUpService(req.body as SignUpInput);
  return new ApiResponse(StatusCodes.CREATED, user, 'User created successfully').send(res);
});

export const signIn = asyncHandler(async (req: Request, res: Response) => {
  const result = await signInService(req.body as SignInInput);
  // Set httpOnly cookie for browser clients; token also returned in body for API clients
  setAuthCookie(res, result.token);
  return new ApiResponse(StatusCodes.OK, result, 'User signed in successfully').send(res);
});

export const signOut = asyncHandler(async (_req: Request, res: Response) => {
  const { clearAuthCookie } = await import('../utils/cookies');
  clearAuthCookie(res);
  return new ApiResponse(StatusCodes.OK, null, 'Signed out successfully').send(res);
});
