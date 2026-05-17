/**
 * Socket.IO event name constants.
 */
export const SocketEvents = {
  NEW_MESSAGE: 'NewMessage',
  NEW_MESSAGE_RECEIVED: 'NewMessageReceived',
  JOIN_CHANNEL: 'JoinChannel',
  LEAVE_CHANNEL: 'LeaveChannel'
} as const;

export type SocketEventName = (typeof SocketEvents)[keyof typeof SocketEvents];
