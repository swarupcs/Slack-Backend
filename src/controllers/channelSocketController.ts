import { Server, Socket } from 'socket.io';

import {
  JOIN_CHANNEL,
  LEAVE_CHANNEL
} from '../utils/common/eventConstants';
import { JoinChannelEventData, SocketCallbackResponse } from '../types/index';

type SocketCallback = (response: SocketCallbackResponse) => void;

/**
 * Registers channel-related socket event handlers.
 * Allows clients to join/leave channel rooms for targeted message delivery.
 */
export default function channelSocketHandlers(io: Server, socket: Socket): void {
  // ─── Join Channel ──────────────────────────────────────────────────────────
  socket.on(
    JOIN_CHANNEL,
    (data: JoinChannelEventData, cb?: SocketCallback): void => {
      const roomId = data.channelId;

      if (!roomId) {
        cb?.({ success: false, message: 'channelId is required' });
        return;
      }

      void socket.join(roomId);
      console.info(`[Socket] User ${socket.id} joined channel: ${roomId}`);

      cb?.({
        success: true,
        message: 'Successfully joined the channel',
        data: roomId
      });
    }
  );

  // ─── Leave Channel ─────────────────────────────────────────────────────────
  socket.on(
    LEAVE_CHANNEL,
    (data: JoinChannelEventData, cb?: SocketCallback): void => {
      const roomId = data.channelId;

      if (!roomId) {
        cb?.({ success: false, message: 'channelId is required' });
        return;
      }

      void socket.leave(roomId);
      console.info(`[Socket] User ${socket.id} left channel: ${roomId}`);

      cb?.({
        success: true,
        message: 'Successfully left the channel',
        data: roomId
      });
    }
  );
}
