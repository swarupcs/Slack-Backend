import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';

import { ENABLE_EMAIL_VERIFICATION } from '../config/serverConfig';
import { addEmailToMailQueue } from '../producers/mailQueueProducer';
import userRepository from '../repositories/userRepository';
import { IUserDocument } from '../schema/user';
import { SignInInput, SignInResponse, SignUpInput } from '../types/index';
import { createJWT } from '../utils/common/authUtils';
import { verifyEmailMail } from '../utils/common/mailObject';
import { ApiError } from '../utils/ApiError';

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export const signUpService = async (data: SignUpInput): Promise<IUserDocument> => {
  const newUser = await userRepository.signUpUser(data);

  if (ENABLE_EMAIL_VERIFICATION) {
    void addEmailToMailQueue({
      ...verifyEmailMail(newUser.verificationToken ?? ''),
      to: newUser.email
    });
  }

  return newUser;
};

// ─── Verify Email Token ───────────────────────────────────────────────────────

export const verifyTokenService = async (token: string): Promise<IUserDocument> => {
  const user = await userRepository.getByToken(token);

  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid verification token');
  }

  if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Verification token has expired');
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiry = null;
  await user.save();

  return user;
};

// ─── Sign In ──────────────────────────────────────────────────────────────────

export const signInService = async (data: SignInInput): Promise<SignInResponse> => {
  const user = await userRepository.getByEmail(data.email);

  if (!user) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'No registered user found with this email'
    );
  }

  const passwordMatch = bcrypt.compareSync(data.password, user.password);
  if (!passwordMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid password, please try again');
  }

  return {
    username: user.username,
    avatar: user.avatar,
    email: user.email,
    _id: user._id,
    token: createJWT({ id: String(user._id), email: user.email })
  };
};
