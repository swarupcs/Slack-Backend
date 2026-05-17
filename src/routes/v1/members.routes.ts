import { Router } from 'express';

import { isMemberPartOfWorkspaceController } from '../../controllers/member.controller';
import { isAuthenticated } from '../../middlewares/auth.middleware';

const router: Router = Router();

router.get(
  '/workspace/:workspaceId',
  isAuthenticated,
  isMemberPartOfWorkspaceController
);

export default router;
