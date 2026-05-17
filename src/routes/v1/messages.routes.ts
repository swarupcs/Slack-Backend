import { Router } from 'express';

import {
  getMessages,
  getUploadAuth
} from '../../controllers/message.controller';
import { isAuthenticated } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/upload-auth', isAuthenticated, getUploadAuth);
router.get('/:channelId', isAuthenticated, getMessages);

export default router;
