import { Request } from 'express';
import { Types } from 'mongoose';

// ─── Augment Express Request ─────────────────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: string;
    }
  }
}

// ─── Entity Types ─────────────────────────────────────────────────────────────

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  username: string;
  password: string;
  avatar?: string;
  isVerified: boolean;
  verificationToken?: string | null;
  verificationTokenExpiry?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkspaceMember {
  memberId: Types.ObjectId | IUser;
  role: 'admin' | 'member';
}

export interface IWorkspace {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  members: IWorkspaceMember[];
  joinCode: string;
  channels: Types.ObjectId[];
}

export interface IChannel {
  _id: Types.ObjectId;
  name: string;
  workspaceId: Types.ObjectId | IWorkspace;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  _id: Types.ObjectId;
  body: string;
  image?: string;
  channelId: Types.ObjectId | IChannel;
  senderId: Types.ObjectId | IUser;
  workspaceId: Types.ObjectId | IWorkspace;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Service Input Types ──────────────────────────────────────────────────────

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
  owner: string;
}

export interface CreateMessageInput {
  body: string;
  image?: string;
  channelId: string;
  senderId: string;
  workspaceId: string;
}

export interface SignUpInput {
  email: string;
  username: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignInResponse {
  username: string;
  avatar?: string;
  email: string;
  _id: Types.ObjectId;
  token: string;
}

export interface JwtPayload {
  id: string;
  email: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
}

// ─── Mail ─────────────────────────────────────────────────────────────────────

export interface MailOptions {
  from: string;
  to?: string;
  subject: string;
  text: string;
}

// ─── Socket Events ────────────────────────────────────────────────────────────

export interface SocketCallbackResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface NewMessageEventData extends CreateMessageInput {
  channelId: string;
}

export interface JoinChannelEventData {
  channelId: string;
}

// ─── Re-export for convenience ────────────────────────────────────────────────
export type { Request };
