import { StatusCodes } from 'http-status-codes';

import userRepository from '../repositories/user.repository';
import workspaceRepository from '../repositories/workspace.repository';
import type { IUserDocument } from '../types/model.types';
import { ApiError } from '../utils/ApiError';
import { isUserMemberOfWorkspace } from './workspace.service';

/**
 * Check if a member is part of a workspace and return the user data.
 */
export async function isMemberPartOfWorkspaceService(
  workspaceId: string,
  memberId: string
): Promise<IUserDocument> {
  const workspace = await workspaceRepository.getById(workspaceId);

  if (!workspace) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  }

  const isMember = isUserMemberOfWorkspace(workspace, memberId);

  if (!isMember) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'User is not a member of this workspace'
    );
  }

  const user = await userRepository.getById(memberId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return user;
}
