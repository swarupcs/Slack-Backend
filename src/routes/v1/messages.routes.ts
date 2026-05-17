import { Router } from 'express';

import {
  deleteMessage,
  editMessage,
  getMessages,
  getUploadAuth,
  toggleReaction
} from '../../controllers/message.controller';
import { isAuthenticated } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { editMessageSchema, toggleReactionSchema } from '../../validators/message.validator';

const router: Router = Router();

router.get('/upload-auth', isAuthenticated, getUploadAuth);
router.get('/:channelId', isAuthenticated, getMessages);
router.put('/:messageId/reactions', isAuthenticated, validate(toggleReactionSchema), toggleReaction);
router.put('/:messageId', isAuthenticated, validate(editMessageSchema), editMessage);
router.delete('/:messageId', isAuthenticated, deleteMessage);

export default router;
