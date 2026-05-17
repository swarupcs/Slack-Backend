import { StatusCodes } from 'http-status-codes';

import channelRepository from '../repositories/channel.repository';
import messageRepository from '../repositories/message.repository';
import workspaceRepository from '../repositories/workspace.repository';
import type {
  IMessagePopulated,
  IChannelDocument
} from '../types/model.types';
import { ApiError } from '../utils/ApiError';
import { isUserMemberOfWorkspace, isUserAdminOfWorkspace } from './workspace.service';

interface ChannelByIdResponse {
  messages: IMessagePopulated[];
  _id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  workspaceId: unknown;
}

/**
 * Get channel details with initial messages (members only).
 */
export async function getChannelByIdService(
  channelId: string,
  userId: string
): Promise<ChannelByIdResponse> {
  const channel =
    await channelRepository.getChannelWithWorkspaceDetails(channelId);

  if (!channel || !channel.workspaceId) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Channel not found with the provided ID'
    );
  }

  const isMember = isUserMemberOfWorkspace(channel.workspaceId, userId);

  if (!isMember) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You are not a member of this workspace and cannot access the channel'
    );
  }

  const messages = await messageRepository.getPaginatedMessages(
    { channelId },
    1,
    20
  );

  return {
    messages,
    _id: channel._id.toString(),
    name: channel.name,
    createdAt: channel.createdAt,
    updatedAt: channel.updatedAt,
    workspaceId: channel.workspaceId
  };
}

/**
 * Rename a channel (Admin only).
 */
export async function renameChannelService(
  channelId: string,
  userId: string,
  newName: string
): Promise<IChannelDocument> {
  const channel = await channelRepository.getChannelWithWorkspaceDetails(channelId);
  if (!channel || !channel.workspaceId) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Channel not found');
  }

  const isAdmin = isUserAdminOfWorkspace(channel.workspaceId, userId);
  if (!isAdmin) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only workspace admins can rename channels');
  }

  const workspaceChannels = channel.workspaceId.channels as any[];
  const isDuplicate = workspaceChannels.some((c) => c.name.toLowerCase() === newName.toLowerCase() && c._id.toString() !== channelId);
  if (isDuplicate) {
    throw new ApiError(StatusCodes.CONFLICT, 'A channel with this name already exists in the workspace');
  }

  const updatedChannel = await channelRepository.update(channelId, { name: newName });
  if (!updatedChannel) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to rename channel');
  }

  return updatedChannel as IChannelDocument;
}

/**
 * Delete a channel and its messages (Admin only).
 */
export async function deleteChannelService(
  channelId: string,
  userId: string
): Promise<void> {
  const channel = await channelRepository.getChannelWithWorkspaceDetails(channelId);
  if (!channel || !channel.workspaceId) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Channel not found');
  }

  if (channel.name === 'general') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot delete the general channel');
  }

  const isAdmin = isUserAdminOfWorkspace(channel.workspaceId, userId);
  if (!isAdmin) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only workspace admins can delete channels');
  }

  // Delete all messages in the channel
  await messageRepository.deleteMany({ channelId });

  // Remove channel reference from workspace
  await workspaceRepository.removeChannelFromWorkspace(channel.workspaceId._id.toString(), channelId);

  // Delete the channel itself
  await channelRepository.delete(channelId);
}

