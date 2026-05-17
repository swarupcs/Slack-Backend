import type { Document, Types } from 'mongoose';

/* ─── Role Enum ──────────────────────────────────────────────────────── */
export enum WorkspaceRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

/* ─── User ───────────────────────────────────────────────────────────── */
export interface IUser {
  email: string;
  password: string;
  username: string;
  avatar?: string;
  status?: string;
  isVerified: boolean;
  verificationToken?: string | null;
  verificationTokenExpiry?: Date | null;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/* ─── Workspace ──────────────────────────────────────────────────────── */
export interface IWorkspaceMember {
  memberId: Types.ObjectId | IUserDocument;
  role: WorkspaceRole;
}

export interface IWorkspace {
  name: string;
  description?: string;
  members: IWorkspaceMember[];
  joinCode: string;
  channels: Types.ObjectId[] | IChannelDocument[];
}

export interface IWorkspaceDocument extends IWorkspace, Document {
  _id: Types.ObjectId;
}

/* ─── Channel ────────────────────────────────────────────────────────── */
export interface IChannel {
  name: string;
  workspaceId: Types.ObjectId | IWorkspaceDocument;
}

export interface IChannelDocument extends IChannel, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/* ─── Message ────────────────────────────────────────────────────────── */
export interface IReaction {
  emoji: string;
  userIds: Types.ObjectId[];
}

export interface IMessage {
  body: string;
  image?: string;
  channelId: Types.ObjectId;
  senderId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  parentMessageId?: Types.ObjectId;
  reactions: IReaction[];
  isEdited: boolean;
}

export interface IMessageDocument extends IMessage, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/* ─── Populated Types (for query results) ────────────────────────────── */
export interface IPopulatedWorkspaceMember {
  memberId: {
    _id: Types.ObjectId;
    username: string;
    email: string;
    avatar?: string;
    status?: string;
  };
  role: WorkspaceRole;
}

export interface IWorkspacePopulated extends Omit<IWorkspaceDocument, 'members' | 'channels'> {
  members: IPopulatedWorkspaceMember[];
  channels: IChannelDocument[];
}

export interface IChannelPopulated extends Omit<IChannelDocument, 'workspaceId'> {
  workspaceId: IWorkspaceDocument;
}

export interface IMessagePopulated extends Omit<IMessageDocument, 'senderId'> {
  senderId: {
    _id: Types.ObjectId;
    username: string;
    email: string;
    avatar?: string;
    status?: string;
  };
}
