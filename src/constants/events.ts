/**
 * Socket.IO event name constants.
 */
export const SocketEvents = {
  NEW_MESSAGE: 'NewMessage',
  NEW_MESSAGE_RECEIVED: 'NewMessageReceived',
  JOIN_CHANNEL: 'JoinChannel',
  LEAVE_CHANNEL: 'LeaveChannel',
  JOIN_WORKSPACE: 'JoinWorkspace',
  LEAVE_WORKSPACE: 'LeaveWorkspace',
  USER_ONLINE: 'UserOnline',
  USER_OFFLINE: 'UserOffline',
  GET_ONLINE_USERS: 'GetOnlineUsers',
  ONLINE_USERS_LIST: 'OnlineUsersList',
} as const;

export type SocketEventName = (typeof SocketEvents)[keyof typeof SocketEvents];
