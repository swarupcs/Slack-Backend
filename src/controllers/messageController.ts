import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import imagekit from '../config/imagekitConfig';
import { getMessagesService } from '../services/messageService';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10)));

  const messages = await getMessagesService(
    { channelId: req.params.channelId },
    page,
    limit,
    req.user!
  );

  return new ApiResponse(StatusCodes.OK, messages, 'Messages fetched successfully').send(res);
});

/**
 * GET /messages/imagekit-auth
 *
 * Returns ImageKit authentication parameters for secure client-side direct uploads.
 *
 * Upload flow:
 *  1. Client fetches auth params from this endpoint (token, expire, signature).
 *  2. Client uploads directly to ImageKit using the SDK + public key + auth params.
 *  3. Client receives the ImageKit URL and includes it in the message payload.
 *  4. Private key never leaves the server.
 */
export const getImageKitAuthParams = asyncHandler(
  async (_req: Request, res: Response) => {
    const authParams = imagekit.getAuthenticationParameters();
    return new ApiResponse(
      StatusCodes.OK,
      authParams,
      'ImageKit auth parameters generated successfully'
    ).send(res);
  }
);
