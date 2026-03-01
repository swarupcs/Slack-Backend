import ImageKit from 'imagekit';

import {
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_URL_ENDPOINT
} from './serverConfig';

/**
 * Singleton ImageKit instance.
 * Used to generate authentication parameters for secure client-side uploads
 * and for server-side image operations.
 */
const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT
});

export default imagekit;
