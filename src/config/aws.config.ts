import AWS from 'aws-sdk';

import { env } from './env.config';

/**
 * AWS S3 client instance.
 */
export const s3 = new AWS.S3({
  region: env.AWS_REGION,
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY
});
