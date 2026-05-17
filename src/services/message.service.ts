import { StatusCodes } from 'http-status-codes';
import type { Types } from 'mongoose';

import channelRepository from '../repositories/channel.repository';
import messageRepository from '../repositories/message.repository';
import type { IMessagePopulated } from '../types/model.types';
import { ApiError } from '../utils/ApiError';
import { isUserMemberOfWorkspace } from './workspace.service';

interface MessageParams {
  channelId: string;
}

interface CreateMessageData {
  body: string;
  image?: string;
  channelId: string;
  senderId: string;
  workspaceId: string;
}

/**
 * Get paginated messages for a channel (members only).
 */
export async function getMessagesService(
  messageParams: MessageParams,
  page: number,
  limit: number,
  userId: string
): Promise<IMessagePopulated[]> {
  const channelDetails =
    await channelRepository.getChannelWithWorkspaceDetails(
      messageParams.channelId
    );

  if (!channelDetails || !channelDetails.workspaceId) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Channel not found');
  }

  const isMember = isUserMemberOfWorkspace(
    channelDetails.workspaceId,
    userId
  );

  if (!isMember) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You are not a member of this workspace'
    );
  }

  return messageRepository.getPaginatedMessages(messageParams, page, limit);
}

/**
 * Create a new message and return it with sender details.
 */
export async function createMessageService(
  data: CreateMessageData
): Promise<IMessagePopulated | null> {
  const newMessage = await messageRepository.create(
    data as unknown as { [key: string]: unknown } & { channelId: Types.ObjectId; senderId: Types.ObjectId; workspaceId: Types.ObjectId }
  );
  return messageRepository.getMessageDetails(newMessage._id.toString());
}
