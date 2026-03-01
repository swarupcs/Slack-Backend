import { Router } from 'express';

import { isMemberPartOfWorkspaceController } from '../../controllers/memberController';
import { isAuthenticated } from '../../middlewares/authMiddleware';

const router = Router();

router.get(
  '/workspace/:workspaceId',
  isAuthenticated,
  isMemberPartOfWorkspaceController
);

export default router;
