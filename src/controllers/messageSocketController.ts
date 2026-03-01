import { Server, Socket } from 'socket.io';

import { createMessageService } from '../services/messageService';
import {
  NewMessageEventData,
  SocketCallbackResponse
} from '../types/index';
import {
  NEW_MESSAGE_EVENT,
  NEW_MESSAGE_RECEIVED_EVENT
} from '../utils/common/eventConstants';

type SocketCallback = (response: SocketCallbackResponse) => void;

/**
 * Registers message-related socket event handlers.
 *
 * Message flow:
 *  1. Client emits NEW_MESSAGE_EVENT with message data.
 *  2. Server persists the message via createMessageService.
 *  3. Server broadcasts the saved message (with sender details) to all
 *     clients in the channel room via NEW_MESSAGE_RECEIVED_EVENT.
 *  4. Callback confirms success to the emitting client.
 */
export default function messageSocketHandlers(
  io: Server,
  socket: Socket
): void {
  socket.on(
    NEW_MESSAGE_EVENT,
    async (
      data: NewMessageEventData,
      cb: SocketCallback
    ): Promise<void> => {
      try {
        const { channelId } = data;

        if (!channelId) {
          cb({ success: false, message: 'channelId is required' });
          return;
        }

        const message = await createMessageService(data);

        // Broadcast to everyone in the channel room (including sender)
        io.to(channelId).emit(NEW_MESSAGE_RECEIVED_EVENT, message);

        cb({
          success: true,
          message: 'Message sent successfully',
          data: message
        });
      } catch (error: unknown) {
        console.error('[Socket] createMessage error:', error);
        cb({ success: false, message: 'Failed to send message' });
      }
    }
  );
}
