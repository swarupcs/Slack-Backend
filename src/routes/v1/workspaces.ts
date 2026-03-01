import { Router } from 'express';

import {
  addChannelToWorkspaceController,
  addMemberToWorkspaceController,
  createWorkspaceController,
  deleteWorkspaceController,
  getWorkspaceByJoinCodeController,
  getWorkspaceController,
  getWorkspacesUserIsMemberOfController,
  joinWorkspaceController,
  resetJoinCodeController,
  updateWorkspaceController
} from '../../controllers/workspaceController';
import { isAuthenticated } from '../../middlewares/authMiddleware';
import {
  addChannelToWorkspaceSchema,
  addMemberToWorkspaceSchema,
  createWorkspaceSchema,
  joinWorkspaceSchema
} from '../../validators/workspaceSchema';
import { validate } from '../../validators/zodValidator';

const router = Router();

// All workspace routes require authentication
router.use(isAuthenticated);

router.post('/', validate(createWorkspaceSchema), createWorkspaceController);
router.get('/', getWorkspacesUserIsMemberOfController);
router.get('/join/:joinCode', getWorkspaceByJoinCodeController);
router.get('/:workspaceId', getWorkspaceController);
router.put('/:workspaceId', updateWorkspaceController);
router.delete('/:workspaceId', deleteWorkspaceController);
router.put('/:workspaceId/join', validate(joinWorkspaceSchema), joinWorkspaceController);
router.put('/:workspaceId/members', validate(addMemberToWorkspaceSchema), addMemberToWorkspaceController);
router.put('/:workspaceId/channels', validate(addChannelToWorkspaceSchema), addChannelToWorkspaceController);
router.put('/:workspaceId/joinCode/reset', resetJoinCodeController);

export default router;
