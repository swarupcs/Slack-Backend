import Bull from 'bull';

import redisConfig from '../config/redisConfig';
import { MailOptions } from '../types/index';

/**
 * Bull queue for outgoing emails.
 * Jobs are processed by mailProcessor and added via mailQueueProducer.
 */
const mailQueue = new Bull<MailOptions>('mailQueue', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

export default mailQueue;
