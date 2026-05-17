import { Router } from 'express';

import v1Router from './v1/index';

const router: import("express").Router = Router();

router.use('/v1', v1Router);

export default router;
