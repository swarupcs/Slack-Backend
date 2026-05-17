import { StatusCodes } from 'http-status-codes';

import channelRepository from '../repositories/channel.repository';
import messageRepository from '../repositories/message.repository';
import type {
  IMessagePopulated
} from '../types/model.types';
import { ApiError } from '../utils/ApiError';
import { isUserMemberOfWorkspace } from './workspace.service';

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
