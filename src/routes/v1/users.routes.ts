import { Router } from 'express';

import { signIn, signUp } from '../../controllers/user.controller';
import { authRateLimiter } from '../../middlewares/rateLimiter.middleware';
import { validate } from '../../middlewares/validation.middleware';
import {
  userSignInSchema,
  userSignUpSchema
} from '../../validators/user.validator';

const router = Router();

router.post(
  '/signup',
  authRateLimiter,
  validate(userSignUpSchema),
  signUp
);

router.post(
  '/signin',
  authRateLimiter,
  validate(userSignInSchema),
  signIn
);

export default router;
