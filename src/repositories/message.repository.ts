import Message from '../models/message.model';
import type { IMessagePopulated } from '../types/model.types';
import crudRepository from './crud.repository';

interface MessageQueryParams {
  channelId?: string;
  parentMessageId?: string;
}

const messageRepository = {
  ...crudRepository(Message),

  /**
   * Get paginated messages.
   * If parentMessageId is not provided, it fetches top-level messages only.
   */
  async getPaginatedMessages(
    params: MessageQueryParams,
    page: number,
    limit: number
  ): Promise<IMessagePopulated[]> {
    const query: any = {};
    if (params.channelId) query.channelId = params.channelId;
    
    if (params.parentMessageId) {
      query.parentMessageId = params.parentMessageId;
    } else {
      query.parentMessageId = { $exists: false };
    }

    return Message.find(query)
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
  },

  /**
   * Toggle an emoji reaction on a message.
   * If the user has already reacted with that emoji, remove it.
   * Otherwise add them. Creates/removes the reaction sub-document as needed.
   */
  async toggleReaction(
    messageId: string,
    emoji: string,
    userId: string
  ): Promise<IMessagePopulated | null> {
    // Check if this emoji reaction already exists with this user
    const existing = await Message.findOne({
      _id: messageId,
      'reactions.emoji': emoji,
      'reactions.userIds': userId
    });

    if (existing) {
      // User already reacted — pull their userId from the array
      await Message.findByIdAndUpdate(messageId, {
        $pull: { 'reactions.$[r].userIds': userId }
      }, {
        arrayFilters: [{ 'r.emoji': emoji }]
      });

      // Clean up empty reaction entries
      await Message.findByIdAndUpdate(messageId, {
        $pull: { reactions: { emoji, userIds: { $size: 0 } } }
      });
    } else {
      // Either emoji reaction doesn't exist yet, or user hasn't reacted yet
      const hasEmojiEntry = await Message.findOne({
        _id: messageId,
        'reactions.emoji': emoji
      });

      if (hasEmojiEntry) {
        // Emoji entry exists — add userId to it
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { 'reactions.$[r].userIds': userId }
        }, {
          arrayFilters: [{ 'r.emoji': emoji }]
        });
      } else {
        // No entry yet — push a new reaction
        await Message.findByIdAndUpdate(messageId, {
          $push: { reactions: { emoji, userIds: [userId] } }
        });
      }
    }

    return this.getMessageDetails(messageId);
  },

  /**
   * Full-text search across messages in a workspace.
   * Returns messages sorted by text-search relevance score.
   */
  async searchMessages(
    workspaceId: string,
    query: string,
    limit = 25
  ): Promise<any[]> {
    return Message.find(
      {
        workspaceId,
        $text: { $search: query }
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .limit(limit)
      .populate('senderId', 'username email avatar')
      .populate('channelId', 'name')
      .lean();
  },

  /**
   * Delete multiple messages based on a query filter.
   */
  async deleteMany(filter: any): Promise<void> {
    await Message.deleteMany(filter);
  },

  /**
   * Get all parent messages (threads) the user has participated in within a workspace.
   */
  async getUserThreads(workspaceId: string, userId: string): Promise<any[]> {
    // Find parent message IDs where this user has replied
    const repliedParentIds = await Message.find({
      workspaceId,
      parentMessageId: { $exists: true },
      senderId: userId
    }).distinct('parentMessageId');

    // Fetch the parent messages themselves, populated
    return Message.find({ _id: { $in: repliedParentIds } })
      .sort({ updatedAt: -1 })
      .populate('senderId', 'username email avatar')
      .populate('channelId', 'name')
      .lean();
  }
};

export default messageRepository;
