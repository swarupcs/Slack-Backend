import type { Server, Socket } from 'socket.io';

import { SocketEvents } from '../constants/events';
import { logger } from '../lib/logger';
import type { JoinWorkspaceData, SocketCallback } from '../types/socket.types';

/**
 * In-memory presence store: workspaceId → Set of userIds currently online.
 * This is a process-level singleton — works perfectly for single-instance servers.
 */
const workspacePresence = new Map<string, Set<string>>();

/**
 * Reverse index: socketId → { workspaceId, userId }
 * Used to look up who disconnected without them sending a leave event.
 */
const socketUserMap = new Map<string, { workspaceId: string; userId: string }>();

export function getOnlineUsers(workspaceId: string): string[] {
  return Array.from(workspacePresence.get(workspaceId) ?? []);
}

/**
 * Socket.IO handler for user presence / workspace-level events.
 */
export default function presenceSocketHandlers(io: Server, socket: Socket): void {
  // ── Join Workspace ────────────────────────────────────────────────────
  socket.on(
    SocketEvents.JOIN_WORKSPACE,
    (data: JoinWorkspaceData, cb?: SocketCallback) => {
      const { workspaceId, userId } = data;

      // Track presence
      if (!workspacePresence.has(workspaceId)) {
        workspacePresence.set(workspaceId, new Set());
      }
      workspacePresence.get(workspaceId)!.add(userId);

      // Track socket → user mapping for disconnect cleanup
      socketUserMap.set(socket.id, { workspaceId, userId });

      // Join the workspace Socket.io room
      socket.join(`workspace:${workspaceId}`);

      logger.debug(`User ${userId} joined workspace ${workspaceId} (socket: ${socket.id})`);

      // Notify everyone else in the workspace that this user came online
      socket.to(`workspace:${workspaceId}`).emit(SocketEvents.USER_ONLINE, { userId });

      // Acknowledge with the current online list so the joining client can sync immediately
      cb?.({
        success: true,
        message: 'Joined workspace',
        data: getOnlineUsers(workspaceId),
      });
    }
  );

  // ── Get Online Users ──────────────────────────────────────────────────
  socket.on(SocketEvents.GET_ONLINE_USERS, (data: { workspaceId: string }, cb?: SocketCallback) => {
    cb?.({
      success: true,
      message: 'Online users',
      data: getOnlineUsers(data.workspaceId),
    });
  });

  // ── Disconnect: auto-clean presence ───────────────────────────────────
  socket.on('disconnect', () => {
    const entry = socketUserMap.get(socket.id);
    if (!entry) return;

    const { workspaceId, userId } = entry;
    socketUserMap.delete(socket.id);

    const members = workspacePresence.get(workspaceId);
    if (members) {
      members.delete(userId);
      if (members.size === 0) workspacePresence.delete(workspaceId);
    }

    logger.debug(`User ${userId} went offline (workspace: ${workspaceId})`);

    // Notify remaining workspace members
    io.to(`workspace:${workspaceId}`).emit(SocketEvents.USER_OFFLINE, { userId });
  });
}
