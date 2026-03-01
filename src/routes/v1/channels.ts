import { Router } from 'express';

import { getChannelByIdController } from '../../controllers/channelController';
import { isAuthenticated } from '../../middlewares/authMiddleware';

const router = Router();

router.get('/:channelId', isAuthenticated, getChannelByIdController);

export default router;
