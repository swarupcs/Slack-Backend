import { StatusCodes } from 'http-status-codes';

import { isMemberPartOfWorkspaceService } from '../services/member.service';
import type { AuthenticatedRequest } from '../types/express.types';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * GET /api/v1/members/workspace/:workspaceId
 */
export const isMemberPartOfWorkspaceController = asyncHandler(
  async (req, res) => {
    const workspaceId = req.params.workspaceId as string;
    const response = await isMemberPartOfWorkspaceService(
      workspaceId,
      (req as AuthenticatedRequest).user
    );

    res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          response,
          'User is a member of the workspace'
        )
      );
  }
);
