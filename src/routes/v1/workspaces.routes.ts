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
  updateWorkspaceController,
  createOrGetDMChannelController,
  searchWorkspaceController
} from '../../controllers/workspace.controller';
import { getWorkspaceUnreadCountsController } from '../../controllers/unread.controller';
import { isAuthenticated } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import {
  addChannelToWorkspaceSchema,
  addMemberToWorkspaceSchema,
  createWorkspaceSchema,
  joinWorkspaceSchema
} from '../../validators/workspace.validator';

const router: import("express").Router = Router();

router.post(
  '/',
  isAuthenticated,
  validate(createWorkspaceSchema),
  createWorkspaceController
);

router.get('/', isAuthenticated, getWorkspacesUserIsMemberOfController);

router.delete('/:workspaceId', isAuthenticated, deleteWorkspaceController);

router.get('/:workspaceId', isAuthenticated, getWorkspaceController);

router.get(
  '/join/:joinCode',
  isAuthenticated,
  getWorkspaceByJoinCodeController
);

router.put(
  '/:workspaceId/join',
  isAuthenticated,
  validate(joinWorkspaceSchema),
  joinWorkspaceController
);

router.put('/:workspaceId', isAuthenticated, updateWorkspaceController);

router.put(
  '/:workspaceId/members',
  isAuthenticated,
  validate(addMemberToWorkspaceSchema),
  addMemberToWorkspaceController
);

router.put(
  '/:workspaceId/channels',
  isAuthenticated,
  validate(addChannelToWorkspaceSchema),
  addChannelToWorkspaceController
);

router.put(
  '/:workspaceId/joinCode/reset',
  isAuthenticated,
  resetJoinCodeController
);

router.put(
  '/:workspaceId/dm',
  isAuthenticated,
  createOrGetDMChannelController
);

router.get('/:workspaceId/search', isAuthenticated, searchWorkspaceController);
router.get('/:workspaceId/unread', isAuthenticated, getWorkspaceUnreadCountsController);

export default router;
