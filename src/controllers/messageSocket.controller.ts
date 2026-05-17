import type { Server, Socket } from 'socket.io';

import { SocketEvents } from '../constants/events';
import { logger } from '../lib/logger';
import { createMessageService } from '../services/message.service';
import type {
  NewMessageData,
  SocketCallback
} from '../types/socket.types';

/**
 * Socket.IO handler for message-related events.
 */
export default function messageSocketHandlers(
  io: Server,
  socket: Socket
): void {
  socket.on(
    SocketEvents.NEW_MESSAGE,
    async (data: NewMessageData, cb: SocketCallback) => {
      try {
        const { channelId, parentMessageId } = data;
        const messageResponse = await createMessageService(data);

        logger.debug(
          `New message in channel ${channelId} from ${socket.id}${parentMessageId ? ` (thread reply for ${parentMessageId})` : ''}`
        );

        // Emit to the channel room so everyone gets it
        io.to(channelId).emit(
          SocketEvents.NEW_MESSAGE_RECEIVED,
          messageResponse
        );

        cb({
          success: true,
          message: 'Successfully created the message',
          data: messageResponse
        });
      } catch (error) {
        logger.error('Socket message handler error:', error);
        cb({
          success: false,
          message: 'Failed to create message'
        });
      }
    }
  );
}
