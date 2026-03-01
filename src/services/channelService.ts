import { StatusCodes } from 'http-status-codes';

import channelRepository from '../repositories/channelRepository';
import messageRepository from '../repositories/messageRepository';
import { IChannelDocument } from '../schema/channel';
import { IMessageDocument } from '../schema/message';
import { IWorkspaceDocument } from '../schema/workspace';
import { ApiError } from '../utils/ApiError';
import { isUserMemberOfWorkspace } from './workspaceService';

export interface ChannelWithMessages {
  _id: IChannelDocument['_id'];
  name: string;
  createdAt: Date;
  updatedAt: Date;
  workspaceId: IChannelDocument['workspaceId'];
  messages: IMessageDocument[];
}

export const getChannelByIdService = async (
  channelId: string,
  userId: string
): Promise<ChannelWithMessages> => {
  const channel = await channelRepository.getChannelWithWorkspaceDetails(channelId);

  if (!channel?.workspaceId) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Channel not found');
  }

  const workspace = channel.workspaceId as unknown as IWorkspaceDocument;

  if (!isUserMemberOfWorkspace(workspace, userId)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'User is not a member of the workspace'
    );
  }

  const messages = await messageRepository.getPaginatedMessages({ channelId }, 1, 20);

  return {
    _id: channel._id,
    name: channel.name,
    createdAt: channel.createdAt,
    updatedAt: channel.updatedAt,
    workspaceId: channel.workspaceId,
    messages
  };
};
