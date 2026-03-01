import Channel, { IChannelDocument } from '../schema/channel';
import crudRepository, { ICrudRepository } from './crudRepository';

// ─── Extended Interface ───────────────────────────────────────────────────────

interface IChannelRepository extends ICrudRepository<IChannelDocument> {
  getChannelWithWorkspaceDetails: (
    channelId: string
  ) => Promise<IChannelDocument | null>;
}

// ─── Repository ───────────────────────────────────────────────────────────────

const channelRepository: IChannelRepository = {
  ...crudRepository<IChannelDocument>(Channel),

  /**
   * Fetches a channel with its parent workspace fully populated.
   * Used to verify workspace membership before channel access.
   */
  getChannelWithWorkspaceDetails: (
    channelId: string
  ): Promise<IChannelDocument | null> =>
    Channel.findById(channelId).populate('workspaceId')
};

export default channelRepository;
