import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IMessageDocument extends Document {
  body: string;
  image?: string;
  channelId: Types.ObjectId;
  senderId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const messageSchema = new Schema<IMessageDocument>(
  {
    body: {
      type: String,
      required: [true, 'Message body is required'],
      trim: true,
      maxlength: [4000, 'Message body cannot exceed 4000 characters']
    },
    image: {
      type: String, // ImageKit URL stored here
      trim: true
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
    }
  },
  {
    timestamps: true,
    toJSON: { versionKey: false }
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Optimise paginated message fetching per channel
messageSchema.index({ channelId: 1, createdAt: -1 });

// ─── Model ────────────────────────────────────────────────────────────────────

const Message: Model<IMessageDocument> = mongoose.model<IMessageDocument>(
  'Message',
  messageSchema
);

export default Message;
