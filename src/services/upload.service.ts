import { StatusCodes } from 'http-status-codes';

import { s3 } from '../config/aws.config';
import { env } from '../config/env.config';
import { imagekit } from '../config/imagekit.config';
import { ApiError } from '../utils/ApiError';

/**
 * Response from the upload service containing
 * all the data the client needs.
 */
export interface UploadAuthParams {
  /** Provider-specific auth/upload token or pre-signed URL */
  token: string;
  /** Upload expiry timestamp (Unix seconds) */
  expire: number;
  /** Provider-specific signature */
  signature: string;
  /** The active upload provider */
  provider: 'imagekit' | 's3';
  /** Pre-signed upload URL (S3 only) */
  uploadUrl?: string;
  /** ImageKit public key (ImageKit only) */
  publicKey?: string;
}

/* ─── ImageKit Provider ──────────────────────────────────────────────── */

/**
 * Generate ImageKit client-side upload authentication parameters.
 */
async function getImageKitAuthParams(): Promise<UploadAuthParams> {
  if (!env.IMAGEKIT_PRIVATE_KEY || !env.IMAGEKIT_PUBLIC_KEY) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'ImageKit credentials are not configured'
    );
  }

  const authParams = imagekit.helper.getAuthenticationParameters();

  return {
    token: authParams.token,
    expire: authParams.expire,
    signature: authParams.signature,
    provider: 'imagekit',
    publicKey: env.IMAGEKIT_PUBLIC_KEY
  };
}

/* ─── AWS S3 Provider ────────────────────────────────────────────────── */

/**
 * Generate an S3 pre-signed URL for direct client upload.
 */
async function getS3AuthParams(): Promise<UploadAuthParams> {
  if (!env.AWS_BUCKET_NAME) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'AWS bucket name is not configured'
    );
  }

  const key = `uploads/${Date.now()}`;
  const expires = 60; // seconds

  const uploadUrl = await s3.getSignedUrlPromise('putObject', {
    Bucket: env.AWS_BUCKET_NAME,
    Key: key,
    Expires: expires
  });

  return {
    token: key,
    expire: Math.floor(Date.now() / 1000) + expires,
    signature: '',
    provider: 's3',
    uploadUrl
  };
}

/* ─── Provider Router ────────────────────────────────────────────────── */

/**
 * Get upload authentication parameters based on the configured provider.
 * Reads `IMAGE_UPLOAD_PROVIDER` from environment to determine which service to use.
 */
export async function getUploadAuthParams(): Promise<UploadAuthParams> {
  const provider = env.IMAGE_UPLOAD_PROVIDER;

  switch (provider) {
    case 'imagekit':
      return getImageKitAuthParams();
    case 's3':
      return getS3AuthParams();
    default:
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Unsupported upload provider: ${provider as string}`
      );
  }
}
