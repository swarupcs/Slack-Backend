import Channel from '../models/channel.model';
import type { IChannelPopulated } from '../types/model.types';
import crudRepository from './crud.repository';

const channelRepository = {
  ...crudRepository(Channel),

  /**
   * Get channel with its workspace populated.
   */
  async getChannelWithWorkspaceDetails(
    channelId: string
  ): Promise<IChannelPopulated | null> {
    return Channel.findById(channelId).populate(
      'workspaceId'
    ) as unknown as Promise<IChannelPopulated | null>;
  }
};

export default channelRepository;
