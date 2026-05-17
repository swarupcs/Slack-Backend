import { StatusCodes } from 'http-status-codes';
import type { Server } from 'socket.io';

import { env } from '../config/env.config';
import { SocketEvents } from '../constants/events';
import { parsePaginationParams } from '../helpers/pagination.helper';
import {
  deleteMessageService,
  editMessageService,
  getMessagesService,
  toggleReactionService
} from '../services/message.service';
import { getUploadAuthParams } from '../services/upload.service';
import type { AuthenticatedRequest } from '../types/express.types';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

// Socket.io server instance — injected at startup via setSocketServer()
let _io: Server | null = null;
export function setSocketServer(io: Server) { _io = io; }

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
    .json(new ApiResponse(StatusCodes.OK, messages, 'Messages fetched successfully'));
});

/**
 * GET /api/v1/messages/upload-auth
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
    .json(new ApiResponse(StatusCodes.OK, updatedMessage, 'Reaction toggled successfully'));
});

/**
 * PUT /api/v1/messages/:messageId
 */
export const editMessage = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId as string;
  const { body } = req.body;
  const userId = (req as AuthenticatedRequest).user;

  const updatedMessage = await editMessageService(messageId, body, userId);

  // Broadcast to everyone in the channel room
  if (_io && updatedMessage) {
    const channelId = (updatedMessage as any).channelId?.toString();
    if (channelId) {
      _io.to(channelId).emit(SocketEvents.MESSAGE_UPDATED, updatedMessage);
    }
  }

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, updatedMessage, 'Message updated successfully'));
});

/**
 * DELETE /api/v1/messages/:messageId
 */
export const deleteMessage = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId as string;
  const userId = (req as AuthenticatedRequest).user;

  // Need channel ID before deleting
  const existing = await (await import('../repositories/message.repository')).default.getMessageDetails(messageId);
  const result = await deleteMessageService(messageId, userId);

  // Broadcast deletion
  if (_io && existing) {
    const channelId = (existing as any).channelId?.toString();
    if (channelId) {
      _io.to(channelId).emit(SocketEvents.MESSAGE_DELETED, { messageId });
    }
  }

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, result, 'Message deleted successfully'));
});
