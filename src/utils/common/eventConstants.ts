/**
 * Socket.IO event name constants.
 * Centralising these prevents typos and makes refactoring easier.
 */
export const NEW_MESSAGE_EVENT = 'NewMessage' as const;
export const NEW_MESSAGE_RECEIVED_EVENT = 'NewMessageReceived' as const;
export const JOIN_CHANNEL = 'JoinChannel' as const;
export const LEAVE_CHANNEL = 'LeaveChannel' as const;

export type SocketEvent =
  | typeof NEW_MESSAGE_EVENT
  | typeof NEW_MESSAGE_RECEIVED_EVENT
  | typeof JOIN_CHANNEL
  | typeof LEAVE_CHANNEL;
