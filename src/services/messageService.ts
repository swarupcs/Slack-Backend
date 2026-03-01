import { StatusCodes } from 'http-status-codes';

import channelRepository from '../repositories/channelRepository';
import messageRepository, { MessageFilterParams } from '../repositories/messageRepository';
import { IMessageDocument } from '../schema/message';
import { IWorkspaceDocument } from '../schema/workspace';
import { CreateMessageInput } from '../types/index';
import { ApiError } from '../utils/ApiError';
import { isUserMemberOfWorkspace } from './workspaceService';

export const getMessagesService = async (
  filter: MessageFilterParams,
  page: number,
  limit: number,
  userId: string
): Promise<IMessageDocument[]> => {
  const channel = await channelRepository.getChannelWithWorkspaceDetails(
    String(filter.channelId)
  );

  if (!channel) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Channel not found');
  }

  const workspace = channel.workspaceId as unknown as IWorkspaceDocument;

  if (!isUserMemberOfWorkspace(workspace, userId)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'User is not a member of the workspace');
  }

  return messageRepository.getPaginatedMessages(filter, page, limit);
};

export const createMessageService = async (
  data: CreateMessageInput
): Promise<IMessageDocument | null> => {
  const created = await messageRepository.create(data);
  return messageRepository.getMessageDetails(String(created._id));
};
