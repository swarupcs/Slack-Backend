import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Tracks the last time a user read a specific channel.
 * Used to calculate unread message counts.
 */
export interface IUserChannelStateDocument extends Document {
  userId: Types.ObjectId;
  channelId: Types.ObjectId;
  lastReadAt: Date;
}

const userChannelStateSchema = new Schema<IUserChannelStateDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
    },
    lastReadAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: false }
);

// One record per user per channel — unique compound index
userChannelStateSchema.index({ userId: 1, channelId: 1 }, { unique: true });

const UserChannelState = mongoose.model<IUserChannelStateDocument>(
  'UserChannelState',
  userChannelStateSchema
);

export default UserChannelState;
