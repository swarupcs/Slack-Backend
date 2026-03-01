import { Router } from 'express';

import {
  getImageKitAuthParams,
  getMessages
} from '../../controllers/messageController';
import { isAuthenticated } from '../../middlewares/authMiddleware';

const router = Router();

// All message routes require authentication
router.use(isAuthenticated);

/**
 * GET /messages/imagekit-auth
 * Returns ImageKit authentication parameters for client-side direct uploads.
 * Must be registered BEFORE the /:channelId route to avoid param clash.
 */
router.get('/imagekit-auth', getImageKitAuthParams);
router.get('/:channelId', getMessages);

export default router;
