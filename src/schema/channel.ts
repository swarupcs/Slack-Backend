import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IChannelDocument extends Document {
  name: string;
  workspaceId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const channelSchema = new Schema<IChannelDocument>(
  {
    name: {
      type: String,
      required: [true, 'Channel name is required'],
      trim: true,
      lowercase: true,
      minlength: [1, 'Channel name cannot be empty'],
      maxlength: [80, 'Channel name cannot exceed 80 characters']
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
// Ensure channel names are unique within a workspace
channelSchema.index({ workspaceId: 1, name: 1 }, { unique: true });

// ─── Model ────────────────────────────────────────────────────────────────────

const Channel: Model<IChannelDocument> = mongoose.model<IChannelDocument>(
  'Channel',
  channelSchema
);

export default Channel;
