import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';

import { workspaceJoinMail } from '../helpers/mail.helper';
import { logger } from '../lib/logger';
import { addEmailToMailQueue } from '../producers/mail.producer';
import channelRepository from '../repositories/channel.repository';
import userRepository from '../repositories/user.repository';
import workspaceRepository from '../repositories/workspace.repository';
import type {
  IWorkspaceDocument,
  IWorkspacePopulated
} from '../types/model.types';
import { WorkspaceRole } from '../types/model.types';
import { ApiError } from '../utils/ApiError';

/* ─── Helper Functions ─────────────────────────────────────────────── */

/**
 * Check if a user is an admin of the workspace.
 */
function isUserAdminOfWorkspace(
  workspace: IWorkspaceDocument | IWorkspacePopulated,
  userId: string
): boolean {
  return workspace.members.some((member) => {
    const memberId =
      typeof member.memberId === 'object' &&
      member.memberId !== null &&
      '_id' in member.memberId
        ? (member.memberId as { _id: { toString(): string } })._id.toString()
        : String(member.memberId);
    return memberId === userId && member.role === WorkspaceRole.ADMIN;
  });
}

/**
 * Check if a user is a member of the workspace.
 */
export function isUserMemberOfWorkspace(
  workspace: IWorkspaceDocument | IWorkspacePopulated,
  userId: string
): boolean {
  return workspace.members.some((member) => {
    const memberId =
      typeof member.memberId === 'object' &&
      member.memberId !== null &&
      '_id' in member.memberId
        ? (member.memberId as { _id: { toString(): string } })._id.toString()
        : String(member.memberId);
    return memberId === userId;
  });
}

/**
 * Check if a channel name already exists in the workspace.
 */
function isChannelAlreadyPartOfWorkspace(
  workspace: IWorkspacePopulated,
  channelName: string
): boolean {
  return workspace.channels.some(
    (channel) => channel.name.toLowerCase() === channelName.toLowerCase()
  );
}

/* ─── Service Functions ────────────────────────────────────────────── */

interface CreateWorkspaceData {
  name: string;
  description?: string;
  owner: string;
}

/**
 * Create a new workspace with an admin member and a default "general" channel.
 */
export async function createWorkspaceService(
  workspaceData: CreateWorkspaceData
): Promise<IWorkspaceDocument> {
  try {
    const joinCode = uuidv4().substring(0, 6).toUpperCase();

    const workspace = await workspaceRepository.create({
      name: workspaceData.name,
      description: workspaceData.description,
      joinCode
    });

    await workspaceRepository.addMemberToWorkspace(
      workspace._id.toString(),
      workspaceData.owner,
      WorkspaceRole.ADMIN
    );

    const updatedWorkspace = await workspaceRepository.addChannelToWorkspace(
      workspace._id.toString(),
      'general'
    );

    logger.info(`Workspace created: ${workspaceData.name}`);
    return updatedWorkspace;
  } catch (error: unknown) {
    const err = error as { name?: string; code?: number };

    if (err.name === 'ValidationError') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Validation error');
    }

    if (err.name === 'MongoServerError' && err.code === 11000) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'A workspace with the same name already exists'
      );
    }

    throw error;
  }
}

/**
 * Fetch all workspaces a user is a member of.
 */
export async function getWorkspacesUserIsMemberOfService(
  userId: string
): Promise<IWorkspacePopulated[]> {
  return workspaceRepository.fetchAllWorkspaceByMemberId(userId);
}

/**
 * Delete a workspace (admin only).
 */
export async function deleteWorkspaceService(
  workspaceId: string,
  userId: string
): Promise<IWorkspaceDocument | null> {
  const workspace = await workspaceRepository.getById(workspaceId);

  if (!workspace) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  }

  if (!isUserAdminOfWorkspace(workspace, userId)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Only workspace admins can delete a workspace'
    );
  }

  // Delete all channels belonging to this workspace
  const channelIds = workspace.channels.map((c) => c.toString());
  await channelRepository.deleteMany(channelIds);

  const deleted = await workspaceRepository.delete(workspaceId);
  logger.info(`Workspace deleted: ${workspace.name}`);
  return deleted;
}

/**
 * Get workspace details (members only).
 */
export async function getWorkspaceService(
  workspaceId: string,
  userId: string
): Promise<IWorkspacePopulated> {
  const workspace =
    await workspaceRepository.getWorkspaceDetailsById(workspaceId);

  if (!workspace) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  }

  if (!isUserMemberOfWorkspace(workspace, userId)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You are not a member of this workspace'
    );
  }

  return workspace;
}

/**
 * Get workspace by join code (members only).
 */
export async function getWorkspaceByJoinCodeService(
  joinCode: string,
  userId: string
): Promise<IWorkspaceDocument | null> {
  const workspace =
    await workspaceRepository.getWorkspaceByJoinCode(joinCode);

  if (!workspace) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  }

  if (!isUserMemberOfWorkspace(workspace, userId)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You are not a member of this workspace'
    );
  }

  return workspace;
}

/**
 * Update workspace details (admin only).
 */
export async function updateWorkspaceService(
  workspaceId: string,
  workspaceData: Partial<IWorkspaceDocument>,
  userId: string
): Promise<IWorkspaceDocument | null> {
  const workspace = await workspaceRepository.getById(workspaceId);

  if (!workspace) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  }

  if (!isUserAdminOfWorkspace(workspace, userId)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Only workspace admins can update the workspace'
    );
  }

  return workspaceRepository.update(workspaceId, workspaceData);
}

/**
 * Reset workspace join code (admin only).
 */
export async function resetWorkspaceJoinCodeService(
  workspaceId: string,
  userId: string
): Promise<IWorkspaceDocument | null> {
  const newJoinCode = uuidv4().substring(0, 6).toUpperCase();
  return updateWorkspaceService(
    workspaceId,
    { joinCode: newJoinCode } as Partial<IWorkspaceDocument>,
    userId
  );
}

/**
 * Add a member to a workspace (admin only).
 */
export async function addMemberToWorkspaceService(
  workspaceId: string,
  memberId: string,
  role: string,
  userId: string
): Promise<IWorkspaceDocument> {
  const workspace = await workspaceRepository.getById(workspaceId);

  if (!workspace) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  }

  if (!isUserAdminOfWorkspace(workspace, userId)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Only workspace admins can add members'
    );
  }

  const validUser = await userRepository.getById(memberId);
  if (!validUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (isUserMemberOfWorkspace(workspace, memberId)) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'User is already a member of this workspace'
    );
  }

  const updated = await workspaceRepository.addMemberToWorkspace(
    workspaceId,
    memberId,
    role
  );

  // Send notification email
  addEmailToMailQueue({
    ...workspaceJoinMail(workspace),
    to: validUser.email
  });

  return updated;
}

/**
 * Add a channel to a workspace (admin only).
 */
export async function addChannelToWorkspaceService(
  workspaceId: string,
  channelName: string,
  userId: string
): Promise<IWorkspaceDocument> {
  const workspace =
    await workspaceRepository.getWorkspaceDetailsById(workspaceId);

  if (!workspace) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  }

  if (!isUserAdminOfWorkspace(workspace, userId)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Only workspace admins can add channels'
    );
  }

  if (isChannelAlreadyPartOfWorkspace(workspace, channelName)) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'A channel with this name already exists in the workspace'
    );
  }

  return workspaceRepository.addChannelToWorkspace(workspaceId, channelName);
}

/**
 * Join a workspace using a join code.
 */
export async function joinWorkspaceService(
  workspaceId: string,
  joinCode: string,
  userId: string
): Promise<IWorkspaceDocument> {
  const workspace =
    await workspaceRepository.getWorkspaceDetailsById(workspaceId);

  if (!workspace) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  }

  if (workspace.joinCode !== joinCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid join code');
  }

  if (isUserMemberOfWorkspace(workspace, userId)) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'You are already a member of this workspace'
    );
  }

  return workspaceRepository.addMemberToWorkspace(
    workspaceId,
    userId,
    WorkspaceRole.MEMBER
  );
}

/**
 * Create or get a Direct Message channel between two users.
 */
export async function createOrGetDMChannelService(
  workspaceId: string,
  userAId: string,
  userBId: string
): Promise<IWorkspaceDocument | { _id: string }> {
  const workspace = await workspaceRepository.getWorkspaceDetailsById(workspaceId);

  if (!workspace) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  }

  // Ensure both users are members
  if (!isUserMemberOfWorkspace(workspace, userAId)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not a member of this workspace');
  }
  if (!isUserMemberOfWorkspace(workspace, userBId)) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'The target user is not a member of this workspace');
  }

  const sortedIds = [userAId, userBId].sort();
  const dmChannelName = `dm-${sortedIds[0]}-${sortedIds[1]}`;

  // Check if it already exists
  const existingChannel = workspace.channels.find(
    (channel) => channel.name === dmChannelName
  );

  if (existingChannel) {
    return existingChannel as any;
  }

  // If not, create it
  await workspaceRepository.addChannelToWorkspace(workspaceId, dmChannelName);
  
  // Re-fetch to get the newly created channel ID
  const updatedWorkspace = await workspaceRepository.getWorkspaceDetailsById(workspaceId);
  const newChannel = updatedWorkspace?.channels.find((c) => c.name === dmChannelName);
  
  return newChannel as any;
}
