import mongoose, { Schema } from 'mongoose';

import type { IWorkspaceDocument } from '../types/model.types';
import { WorkspaceRole } from '../types/model.types';

const workspaceSchema = new Schema<IWorkspaceDocument>(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    members: [
      {
        memberId: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        role: {
          type: String,
          enum: Object.values(WorkspaceRole),
          default: WorkspaceRole.MEMBER
        }
      }
    ],
    joinCode: {
      type: String,
      required: [true, 'Join code is required']
    },
    channels: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Channel'
      }
    ]
  },
  { timestamps: true }
);

const Workspace = mongoose.model<IWorkspaceDocument>(
  'Workspace',
  workspaceSchema
);

export default Workspace;
