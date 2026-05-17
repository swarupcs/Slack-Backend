import { Router } from 'express';

import channelRouter from './channels.routes';
import memberRouter from './members.routes';
import messageRouter from './messages.routes';
import userRouter from './users.routes';
import workspaceRouter from './workspaces.routes';

const router: import("express").Router = Router();

router.use('/users', userRouter);
router.use('/workspaces', workspaceRouter);
router.use('/channels', channelRouter);
router.use('/members', memberRouter);
router.use('/messages', messageRouter);

export default router;
