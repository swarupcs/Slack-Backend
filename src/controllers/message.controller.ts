import { StatusCodes } from 'http-status-codes';

import { env } from '../config/env.config';
import { parsePaginationParams } from '../helpers/pagination.helper';
import { getMessagesService, toggleReactionService } from '../services/message.service';
import { getUploadAuthParams } from '../services/upload.service';
import type { AuthenticatedRequest } from '../types/express.types';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * GET /api/v1/messages/:channelId
 */
export const getMessages = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaginationParams(
    req.query.page as string | undefined,
    req.query.limit as string | undefined
  );

  const channelId = req.params.channelId as string;
  const parentMessageId = req.query.parentMessageId as string | undefined;

  const messages = await getMessagesService(
    { channelId, parentMessageId },
    page,
    limit,
    (req as AuthenticatedRequest).user
  );

  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(StatusCodes.OK, messages, 'Messages fetched successfully')
    );
});

/**
 * GET /api/v1/messages/upload-auth
 * Returns upload authentication parameters for the configured provider
 * (ImageKit or AWS S3, controlled by IMAGE_UPLOAD_PROVIDER env variable).
 */
export const getUploadAuth = asyncHandler(async (_req, res) => {
  const authParams = await getUploadAuthParams();

  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        authParams,
        `Upload auth generated via ${env.IMAGE_UPLOAD_PROVIDER}`
      )
    );
});

/**
 * PUT /api/v1/messages/:messageId/reactions
 */
export const toggleReaction = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId as string;
  const { emoji } = req.body;
  const userId = (req as AuthenticatedRequest).user;

  const updatedMessage = await toggleReactionService(messageId, emoji, userId);

  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(StatusCodes.OK, updatedMessage, 'Reaction toggled successfully')
    );
});
