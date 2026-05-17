import { Router } from 'express';

import { getChannelByIdController } from '../../controllers/channel.controller';
import { isAuthenticated } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/:channelId', isAuthenticated, getChannelByIdController);

export default router;
