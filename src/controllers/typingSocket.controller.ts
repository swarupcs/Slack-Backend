import type { Server, Socket } from 'socket.io';

import { SocketEvents } from '../constants/events';
import { logger } from '../lib/logger';

interface TypingData {
  channelId: string;
  userId: string;
  username: string;
}

/**
 * Relay TypingStart / TypingStop events to the channel room
 * excluding the sender — pure relay, no DB writes needed.
 */
export default function typingSocketHandlers(
  _io: Server,
  socket: Socket
): void {
  socket.on(SocketEvents.TYPING_START, (data: TypingData) => {
    if (!data.channelId) return;
    logger.debug(`TypingStart: ${data.username} in channel ${data.channelId}`);
    // Broadcast to everyone in the channel EXCEPT the sender
    socket.to(data.channelId).emit(SocketEvents.TYPING_START, {
      userId: data.userId,
      username: data.username,
      channelId: data.channelId,
    });
  });

  socket.on(SocketEvents.TYPING_STOP, (data: TypingData) => {
    if (!data.channelId) return;
    logger.debug(`TypingStop: ${data.username} in channel ${data.channelId}`);
    socket.to(data.channelId).emit(SocketEvents.TYPING_STOP, {
      userId: data.userId,
      channelId: data.channelId,
    });
  });
}
