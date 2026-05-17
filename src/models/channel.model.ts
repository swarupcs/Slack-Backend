import mongoose, { Schema } from 'mongoose';

import type { IChannelDocument } from '../types/model.types';

const channelSchema = new Schema<IChannelDocument>(
  {
    name: {
      type: String,
      required: [true, 'Channel name is required'],
      trim: true
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required']
    }
  },
  { timestamps: true }
);

const Channel = mongoose.model<IChannelDocument>('Channel', channelSchema);

export default Channel;
