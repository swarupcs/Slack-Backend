import type { Server, Socket } from 'socket.io';

/**
 * Socket event data types.
 */
export interface JoinChannelData {
  channelId: string;
}

export interface NewMessageData {
  body: string;
  image?: string;
  channelId: string;
  senderId: string;
  workspaceId: string;
}

export interface SocketCallbackResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export type SocketCallback = (response: SocketCallbackResponse) => void;

/**
 * Typed socket handler function signature.
 */
export type SocketHandler = (io: Server, socket: Socket) => void;
