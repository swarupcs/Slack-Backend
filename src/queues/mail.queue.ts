import Queue from 'bull';

import { redisConfig } from '../config/redis.config';

const mailQueue = new Queue('mailQueue', {
  redis: redisConfig
});

export default mailQueue;
