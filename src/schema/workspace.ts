import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface IWorkspaceMemberDocument {
  memberId: Types.ObjectId;
  role: 'admin' | 'member';
}

export interface IWorkspaceDocument extends Document {
  name: string;
  description?: string;
  members: IWorkspaceMemberDocument[];
  joinCode: string;
  channels: Types.ObjectId[];
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const memberSchema = new Schema<IWorkspaceMemberDocument>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    }
  },
  { _id: false }
);

const workspaceSchema = new Schema<IWorkspaceDocument>(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Workspace name must be at least 3 characters'],
      maxlength: [50, 'Workspace name cannot exceed 50 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    members: [memberSchema],
    joinCode: {
      type: String,
      required: [true, 'Join code is required'],
      uppercase: true
    },
    channels: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Channel'
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { versionKey: false }
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
workspaceSchema.index({ joinCode: 1 }, { unique: true });
workspaceSchema.index({ 'members.memberId': 1 });

// ─── Model ────────────────────────────────────────────────────────────────────

const Workspace: Model<IWorkspaceDocument> = mongoose.model<IWorkspaceDocument>(
  'Workspace',
  workspaceSchema
);

export default Workspace;
