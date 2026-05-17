import type { Server, Socket } from 'socket.io';

import { SocketEvents } from '../constants/events';
import { logger } from '../lib/logger';
import type {
  JoinChannelData,
  SocketCallback
} from '../types/socket.types';

/**
 * Socket.IO handler for channel-related events.
 */
export default function channelSocketHandlers(
  _io: Server,
  socket: Socket
): void {
  socket.on(
    SocketEvents.JOIN_CHANNEL,
    (data: JoinChannelData, cb?: SocketCallback) => {
      const roomId = data.channelId;
      socket.join(roomId);
      logger.debug(`User ${socket.id} joined channel: ${roomId}`);

      cb?.({
        success: true,
        message: 'Successfully joined the channel',
        data: roomId
      });
    }
  );
}
