import mongoose, { Schema } from 'mongoose';

import type { IMessageDocument } from '../types/model.types';

const messageSchema = new Schema<IMessageDocument>(
  {
    body: {
      type: String,
      required: [true, 'Message body is required']
    },
    image: {
      type: String
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
      required: [true, 'Channel ID is required']
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required']
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required']
    },
    parentMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message'
    },
    reactions: [
      {
        emoji: { type: String, required: true },
        userIds: [{ type: Schema.Types.ObjectId, ref: 'User' }]
      }
    ]
  },
  { timestamps: true }
);

const Message = mongoose.model<IMessageDocument>('Message', messageSchema);

export default Message;
