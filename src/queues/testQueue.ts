import Bull from 'bull';

import redisConfig from '../config/redisConfig';

const testQueue = new Bull<Record<string, unknown>>('testQueue', {
  redis: redisConfig
});

export default testQueue;
