import { Router } from 'express';

import {
  getChannelByIdController,
  renameChannelController,
  deleteChannelController
} from '../../controllers/channel.controller';
import { markChannelReadController } from '../../controllers/unread.controller';
import { isAuthenticated } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/:channelId', isAuthenticated, getChannelByIdController);
router.put('/:channelId', isAuthenticated, renameChannelController);
router.delete('/:channelId', isAuthenticated, deleteChannelController);
router.put('/:channelId/read', isAuthenticated, markChannelReadController);

export default router;
