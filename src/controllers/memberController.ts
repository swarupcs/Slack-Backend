import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { isMemberPartOfWorkspaceService } from '../services/memberService';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const isMemberPartOfWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await isMemberPartOfWorkspaceService(
      req.params.workspaceId,
      req.user!
    );
    return new ApiResponse(
      StatusCodes.OK,
      user,
      'User is a member of the workspace'
    ).send(res);
  }
);
