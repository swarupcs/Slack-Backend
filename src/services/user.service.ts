import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';

import { env } from '../config/env.config';
import { createJWT } from '../helpers/jwt.helper';
import { verifyEmailMail } from '../helpers/mail.helper';
import { logger } from '../lib/logger';
import { addEmailToMailQueue } from '../producers/mail.producer';
import userRepository from '../repositories/user.repository';
import type { IUserDocument } from '../types/model.types';
import { ApiError } from '../utils/ApiError';

interface SignUpData {
  email: string;
  username: string;
  password: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface SignInResponse {
  username: string;
  avatar?: string;
  email: string;
  _id: string;
  token: string;
}

/**
 * Register a new user.
 */
export async function signUpService(data: SignUpData): Promise<IUserDocument> {
  try {
    const newUser = await userRepository.signUpUser(data);

    if (env.ENABLE_EMAIL_VERIFICATION === 'true' && newUser.verificationToken) {
      addEmailToMailQueue({
        ...verifyEmailMail(newUser.verificationToken),
        to: newUser.email
      });
    }

    return newUser;
  } catch (error: unknown) {
    const err = error as { name?: string; code?: number; errors?: unknown; message?: string };

    if (err.name === 'ValidationError') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Validation error',
        [err.message ?? 'Invalid data']
      );
    }

    if (err.name === 'MongoServerError' && err.code === 11000) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'A user with the same email or username already exists'
      );
    }

    throw error;
  }
}

/**
 * Verify a user's email using their verification token.
 */
export async function verifyTokenService(
  token: string
): Promise<IUserDocument> {
  const user = await userRepository.getByToken(token);

  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid verification token');
  }

  if (
    user.verificationTokenExpiry &&
    user.verificationTokenExpiry.getTime() < Date.now()
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Verification token has expired'
    );
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiry = null;
  await user.save();

  return user;
}

/**
 * Authenticate a user and return a JWT token.
 */
export async function signInService(
  data: SignInData
): Promise<SignInResponse> {
  const user = await userRepository.getByEmail(data.email);

  if (!user) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'No registered user found with this email'
    );
  }

  const isMatch = bcrypt.compareSync(data.password, user.password);

  if (!isMatch) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Invalid password, please try again'
    );
  }

  logger.info(`User signed in: ${user.email}`);

  return {
    username: user.username,
    avatar: user.avatar,
    email: user.email,
    _id: user._id.toString(),
    token: createJWT({ id: user._id.toString(), email: user.email })
  };
}
