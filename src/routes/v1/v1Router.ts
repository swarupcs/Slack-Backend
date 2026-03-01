import { Router } from 'express';

import channelRouter from './channels';
import memberRouter from './members';
import messageRouter from './messages';
import userRouter from './users';
import workspaceRouter from './workspaces';

const router = Router();

router.use('/users', userRouter);
router.use('/workspaces', workspaceRouter);
router.use('/channels', channelRouter);
router.use('/members', memberRouter);
router.use('/messages', messageRouter);

export default router;
