import ImageKit from '@imagekit/nodejs';

import { env } from './env.config';

/**
 * ImageKit client instance for image uploads.
 * Only initialized when ImageKit credentials are configured.
 */
export const imagekit = new ImageKit({
  privateKey: env.IMAGEKIT_PRIVATE_KEY ?? '',
  baseURL: env.IMAGEKIT_URL_ENDPOINT ?? ''
});
