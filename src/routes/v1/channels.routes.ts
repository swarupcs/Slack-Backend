import { Router } from 'express';

import { getChannelByIdController } from '../../controllers/channel.controller';
import { markChannelReadController } from '../../controllers/unread.controller';
import { isAuthenticated } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/:channelId', isAuthenticated, getChannelByIdController);
router.put('/:channelId/read', isAuthenticated, markChannelReadController);

export default router;
