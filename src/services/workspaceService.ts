import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';

import { addEmailToMailQueue } from '../producers/mailQueueProducer';
import channelRepository from '../repositories/channelRepository';
import userRepository from '../repositories/userRepository';
import workspaceRepository from '../repositories/workspaceRepository';
import { IWorkspaceDocument, IWorkspaceMemberDocument } from '../schema/workspace';
import { CreateWorkspaceInput } from '../types/index';
import { workspaceJoinMail } from '../utils/common/mailObject';
import { ApiError } from '../utils/ApiError';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const isUserAdminOfWorkspace = (
  workspace: IWorkspaceDocument,
  userId: string
): IWorkspaceMemberDocument | undefined =>
  workspace.members.find((m) => {
    const id =
      (m.memberId as unknown as { _id: { toString(): string } })._id?.toString() ??
      m.memberId.toString();
    return id === userId && m.role === 'admin';
  });

export const isUserMemberOfWorkspace = (
  workspace: IWorkspaceDocument,
  userId: string
): IWorkspaceMemberDocument | undefined =>
  workspace.members.find((m) => {
    const id =
      (m.memberId as unknown as { _id: { toString(): string } })._id?.toString() ??
      m.memberId.toString();
    return id === userId;
  });

const isChannelAlreadyInWorkspace = (
  workspace: IWorkspaceDocument,
  channelName: string
): boolean =>
  (workspace.channels as unknown as { name: string }[]).some(
    (ch) => ch.name.toLowerCase() === channelName.toLowerCase()
  );

// ─── Services ─────────────────────────────────────────────────────────────────

export const createWorkspaceService = async (
  data: CreateWorkspaceInput
): Promise<IWorkspaceDocument> => {
  const joinCode = uuidv4().substring(0, 6).toUpperCase();

  const workspace = await workspaceRepository.create({
    name: data.name,
    description: data.description,
    joinCode
  });

  await workspaceRepository.addMemberToWorkspace(
    String(workspace._id),
    data.owner,
    'admin'
  );

  return workspaceRepository.addChannelToWorkspace(String(workspace._id), 'general');
};

export const getWorkspacesUserIsMemberOfService = async (
  userId: string
): Promise<IWorkspaceDocument[]> =>
  workspaceRepository.fetchAllWorkspacesByMemberId(userId);

export const deleteWorkspaceService = async (
  workspaceId: string,
  userId: string
): Promise<IWorkspaceDocument | null> => {
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

  await channelRepository.deleteMany(workspace.channels.map(String));
  return workspaceRepository.delete(workspaceId);
};

export const getWorkspaceService = async (
  workspaceId: string,
  userId: string
): Promise<IWorkspaceDocument> => {
  const workspace = await workspaceRepository.getWorkspaceDetailsById(workspaceId);

  if (!workspace) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  }

  if (!isUserMemberOfWorkspace(workspace, userId)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'User is not a member of the workspace'
    );
  }

  return workspace;
};

export const getWorkspaceByJoinCodeService = async (
  joinCode: string,
  userId: string
): Promise<IWorkspaceDocument> => {
  const workspace = await workspaceRepository.getWorkspaceByJoinCode(joinCode);

  if (!isUserMemberOfWorkspace(workspace, userId)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'User is not a member of the workspace'
    );
  }

  return workspace;
};

export const updateWorkspaceService = async (
  workspaceId: string,
  updateData: Partial<{ name: string; description: string }>,
  userId: string
): Promise<IWorkspaceDocument | null> => {
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

  return workspaceRepository.update(workspaceId, updateData);
};

export const resetWorkspaceJoinCodeService = async (
  workspaceId: string,
  userId: string
): Promise<IWorkspaceDocument | null> => {
  const newJoinCode = uuidv4().substring(0, 6).toUpperCase();

  const workspace = await workspaceRepository.getById(workspaceId);
  if (!workspace) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  }

  if (!isUserAdminOfWorkspace(workspace, userId)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Only workspace admins can reset the join code'
    );
  }

  return workspaceRepository.update(workspaceId, { joinCode: newJoinCode });
};

export const addMemberToWorkspaceService = async (
  workspaceId: string,
  memberId: string,
  role: 'admin' | 'member',
  userId: string
): Promise<IWorkspaceDocument> => {
  const workspace = await workspaceRepository.getById(workspaceId);

  if (!workspace) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  }

  if (!isUserAdminOfWorkspace(workspace, userId)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only workspace admins can add members');
  }

  const targetUser = await userRepository.getById(memberId);
  if (!targetUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (isUserMemberOfWorkspace(workspace, memberId)) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'User is already a member of the workspace'
    );
  }

  const updated = await workspaceRepository.addMemberToWorkspace(
    workspaceId,
    memberId,
    role
  );

  void addEmailToMailQueue({
    ...workspaceJoinMail(workspace as unknown as import('../types/index').IWorkspace),
    to: targetUser.email
  });

  return updated;
};

export const addChannelToWorkspaceService = async (
  workspaceId: string,
  channelName: string,
  userId: string
): Promise<IWorkspaceDocument> => {
  const workspace = await workspaceRepository.getWorkspaceDetailsById(workspaceId);

  if (!workspace) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  }

  if (!isUserAdminOfWorkspace(workspace, userId)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only workspace admins can add channels');
  }

  if (isChannelAlreadyInWorkspace(workspace, channelName)) {
    throw new ApiError(StatusCodes.CONFLICT, 'Channel already exists in this workspace');
  }

  return workspaceRepository.addChannelToWorkspace(workspaceId, channelName);
};

export const joinWorkspaceService = async (
  workspaceId: string,
  joinCode: string,
  userId: string
): Promise<IWorkspaceDocument> => {
  const workspace = await workspaceRepository.getWorkspaceDetailsById(workspaceId);

  if (!workspace) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  }

  if (workspace.joinCode !== joinCode.toUpperCase()) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid join code');
  }

  return workspaceRepository.addMemberToWorkspace(workspaceId, userId, 'member');
};
