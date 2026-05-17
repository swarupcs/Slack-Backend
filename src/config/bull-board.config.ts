import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';

import mailQueue from '../queues/mail.queue';

/**
 * Bull Board dashboard adapter for monitoring queues.
 */
const bullServerAdapter = new ExpressAdapter();
bullServerAdapter.setBasePath('/ui');

createBullBoard({
  queues: [new BullAdapter(mailQueue)],
  serverAdapter: bullServerAdapter
});

export default bullServerAdapter;
