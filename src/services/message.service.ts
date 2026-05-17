import { StatusCodes } from 'http-status-codes';
import type { Types } from 'mongoose';

import channelRepository from '../repositories/channel.repository';
import messageRepository from '../repositories/message.repository';
import type { IMessagePopulated } from '../types/model.types';
import { ApiError } from '../utils/ApiError';
import { isUserMemberOfWorkspace } from './workspace.service';

interface MessageParams {
  channelId?: string;
  parentMessageId?: string;
}

interface CreateMessageData {
  body: string;
  image?: string;
  channelId: string;
  senderId: string;
  workspaceId: string;
  parentMessageId?: string;
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
  if (!messageParams.channelId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Channel ID is required');
  }

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

/**
 * Toggle an emoji reaction on a message.
 */
export async function toggleReactionService(
  messageId: string,
  emoji: string,
  userId: string
): Promise<IMessagePopulated | null> {
  const message = await messageRepository.getById(messageId);
  if (!message) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Message not found');
  }
  return messageRepository.toggleReaction(messageId, emoji, userId);
}

/**
 * Edit a message body (author only).
 */
export async function editMessageService(
  messageId: string,
  newBody: string,
  userId: string
): Promise<IMessagePopulated | null> {
  const message = await messageRepository.getById(messageId);
  if (!message) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Message not found');
  }
  if (message.senderId.toString() !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You can only edit your own messages');
  }
  await messageRepository.update(messageId, { body: newBody, isEdited: true });
  return messageRepository.getMessageDetails(messageId);
}

/**
 * Delete a message (author only).
 */
export async function deleteMessageService(
  messageId: string,
  userId: string
): Promise<{ messageId: string }> {
  const existingMessage = await messageRepository.getById(messageId);
  if (!existingMessage) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Message not found');
  }

  if (existingMessage.senderId.toString() !== userId.toString()) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to delete this message'
    );
  }

  // If this message has replies, we should ideally delete replies too, 
  // but for now just delete the message itself.
  await messageRepository.delete(messageId);
  return { messageId };
}

/**
 * Get all threads a user is part of in a workspace.
 */
export async function getUserThreadsService(
  workspaceId: string,
  userId: string
): Promise<any[]> {
  const workspaceRepository = (await import('../repositories/workspace.repository')).default;
  const workspace = await workspaceRepository.getById(workspaceId);
  if (!workspace) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  }

  const isMember = isUserMemberOfWorkspace(workspace as any, userId);
  if (!isMember) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not a member of this workspace');
  }

  return messageRepository.getUserThreads(workspaceId, userId);
}
