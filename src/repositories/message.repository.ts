import Message from '../models/message.model';
import type { IMessagePopulated } from '../types/model.types';
import crudRepository from './crud.repository';

interface MessageQueryParams {
  channelId: string;
}

const messageRepository = {
  ...crudRepository(Message),

  /**
   * Get paginated messages for a channel, sorted newest first.
   */
  async getPaginatedMessages(
    params: MessageQueryParams,
    page: number,
    limit: number
  ): Promise<IMessagePopulated[]> {
    return Message.find(params)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(
        'senderId',
        'username email avatar'
      ) as unknown as Promise<IMessagePopulated[]>;
  },

  /**
   * Get full message details with sender info populated.
   */
  async getMessageDetails(
    messageId: string
  ): Promise<IMessagePopulated | null> {
    return Message.findById(messageId).populate(
      'senderId',
      'username email avatar'
    ) as unknown as Promise<IMessagePopulated | null>;
  }
};

export default messageRepository;
