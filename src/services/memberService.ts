import { StatusCodes } from 'http-status-codes';

import userRepository from '../repositories/userRepository';
import workspaceRepository from '../repositories/workspaceRepository';
import { IUserDocument } from '../schema/user';
import { ApiError } from '../utils/ApiError';
import { isUserMemberOfWorkspace } from './workspaceService';

export const isMemberPartOfWorkspaceService = async (
  workspaceId: string,
  memberId: string
): Promise<IUserDocument> => {
  const workspace = await workspaceRepository.getById(workspaceId);

  if (!workspace) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  }

  if (!isUserMemberOfWorkspace(workspace, memberId)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'User is not a member of the workspace'
    );
  }

  const user = await userRepository.getById(memberId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return user;
};
