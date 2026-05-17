import Message from '../models/message.model';
import UserChannelState from '../models/userChannelState.model';

const unreadRepository = {
  /**
   * Upserts lastReadAt = now for a user/channel pair.
   */
  async markChannelRead(userId: string, channelId: string): Promise<void> {
    await UserChannelState.findOneAndUpdate(
      { userId, channelId },
      { lastReadAt: new Date() },
      { upsert: true, new: true }
    );
  },

  /**
   * Returns the number of messages in `channelId` that were created
   * after the user's `lastReadAt`. If no read record exists, returns
   * the full message count (capped at 99 for display purposes).
   */
  async getUnreadCount(userId: string, channelId: string): Promise<number> {
    const state = await UserChannelState.findOne({ userId, channelId });

    const query: any = {
      channelId,
      parentMessageId: { $exists: false }, // only top-level messages
    };

    if (state) {
      query.createdAt = { $gt: state.lastReadAt };
    }

    const count = await Message.countDocuments(query);
    return Math.min(count, 99);
  },

  /**
   * Returns a map of channelId → unreadCount for all channels
   * in a workspace the user has a state record for. Channels with
   * no state record are treated as "all messages unread" but capped at 99.
   */
  async getWorkspaceUnreadCounts(
    userId: string,
    channelIds: string[]
  ): Promise<Record<string, number>> {
    if (channelIds.length === 0) return {};

    // Fetch all state records for these channels in one query
    const states = await UserChannelState.find({
      userId,
      channelId: { $in: channelIds },
    });

    const stateMap = new Map(
      states.map((s) => [s.channelId.toString(), s.lastReadAt])
    );

    // Count unread for each channel in parallel
    const results = await Promise.all(
      channelIds.map(async (channelId) => {
        const lastReadAt = stateMap.get(channelId);
        const query: any = {
          channelId,
          parentMessageId: { $exists: false },
        };
        if (lastReadAt) {
          query.createdAt = { $gt: lastReadAt };
        }
        const count = await Message.countDocuments(query);
        return [channelId, Math.min(count, 99)] as [string, number];
      })
    );

    return Object.fromEntries(results.filter(([, count]) => count > 0));
  },
};

export default unreadRepository;
