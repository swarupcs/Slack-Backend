import { StatusCodes } from 'http-status-codes';

import unreadRepository from '../repositories/unread.repository';
import workspaceRepository from '../repositories/workspace.repository';
import type { AuthenticatedRequest } from '../types/express.types';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * PUT /api/v1/channels/:channelId/read
 * Marks all messages in a channel as read for the current user.
 */
export const markChannelReadController = asyncHandler(async (req, res) => {
  const channelId = req.params.channelId as string;
  const userId = (req as AuthenticatedRequest).user;

  await unreadRepository.markChannelRead(userId, channelId);

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, null, 'Channel marked as read'));
});

/**
 * GET /api/v1/workspaces/:workspaceId/unread
 * Returns a map of channelId → unreadCount for the current user
 * across all channels in the workspace.
 */
export const getWorkspaceUnreadCountsController = asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId as string;
  const userId = (req as AuthenticatedRequest).user;

  const workspace = await workspaceRepository.getById(workspaceId);
  if (!workspace) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  }

  const channelIds = (workspace.channels as any[]).map((c) =>
    c._id ? c._id.toString() : c.toString()
  );

  const counts = await unreadRepository.getWorkspaceUnreadCounts(userId, channelIds);

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, counts, 'Unread counts fetched'));
});
