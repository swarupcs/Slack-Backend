import { Router } from 'express';

import { signIn, signOut, signUp } from '../../controllers/userController';
import { isAuthenticated } from '../../middlewares/authMiddleware';
import { userSignInSchema, userSignUpSchema } from '../../validators/userSchema';
import { validate } from '../../validators/zodValidator';

const router = Router();

router.post('/signup', validate(userSignUpSchema), signUp);
router.post('/signin', validate(userSignInSchema), signIn);
router.post('/signout', isAuthenticated, signOut);

export default router;
