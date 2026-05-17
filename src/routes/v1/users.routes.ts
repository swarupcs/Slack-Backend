import { Router } from 'express';

import { signIn, signUp, updateProfile, updatePassword } from '../../controllers/user.controller';
import { authRateLimiter } from '../../middlewares/rateLimiter.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { isAuthenticated } from '../../middlewares/auth.middleware';
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

router.put('/me', isAuthenticated, updateProfile);
router.put('/me/password', isAuthenticated, updatePassword);

export default router;
