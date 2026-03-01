import { FilterQuery } from 'mongoose';

import Message, { IMessageDocument } from '../schema/message';
import crudRepository, { ICrudRepository } from './crudRepository';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MessageFilterParams = FilterQuery<IMessageDocument>;

// ─── Extended Interface ───────────────────────────────────────────────────────

interface IMessageRepository extends ICrudRepository<IMessageDocument> {
  getPaginatedMessages: (
    filter: MessageFilterParams,
    page: number,
    limit: number
  ) => Promise<IMessageDocument[]>;
  getMessageDetails: (messageId: string) => Promise<IMessageDocument | null>;
}

// ─── Repository ───────────────────────────────────────────────────────────────

const messageRepository: IMessageRepository = {
  ...crudRepository<IMessageDocument>(Message),

  /**
   * Fetches paginated messages sorted newest-first.
   * Sender details (username, email, avatar) are populated for UI rendering.
   */
  getPaginatedMessages: (
    filter: MessageFilterParams,
    page: number,
    limit: number
  ): Promise<IMessageDocument[]> =>
    Message.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('senderId', 'username email avatar'),

  /**
   * Fetches full message details including populated sender.
   * Used after creating a message so the socket emitter has full data.
   */
  getMessageDetails: (
    messageId: string
  ): Promise<IMessageDocument | null> =>
    Message.findById(messageId).populate('senderId', 'username email avatar')
};

export default messageRepository;
