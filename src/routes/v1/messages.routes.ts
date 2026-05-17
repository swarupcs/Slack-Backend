import { Router } from 'express';

import {
  getMessages,
  getUploadAuth,
  toggleReaction
} from '../../controllers/message.controller';
import { isAuthenticated } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/upload-auth', isAuthenticated, getUploadAuth);
router.get('/:channelId', isAuthenticated, getMessages);
router.put('/:messageId/reactions', isAuthenticated, toggleReaction);

export default router;
