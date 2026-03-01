import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import {
  addChannelToWorkspaceService,
  addMemberToWorkspaceService,
  createWorkspaceService,
  deleteWorkspaceService,
  getWorkspaceByJoinCodeService,
  getWorkspaceService,
  getWorkspacesUserIsMemberOfService,
  joinWorkspaceService,
  resetWorkspaceJoinCodeService,
  updateWorkspaceService
} from '../services/workspaceService';
import { verifyTokenService } from '../services/userService';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const createWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspace = await createWorkspaceService({
      ...(req.body as { name: string; description?: string }),
      owner: req.user!
    });
    return new ApiResponse(
      StatusCodes.CREATED,
      workspace,
      'Workspace created successfully'
    ).send(res);
  }
);

export const getWorkspacesUserIsMemberOfController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaces = await getWorkspacesUserIsMemberOfService(req.user!);
    return new ApiResponse(
      StatusCodes.OK,
      workspaces,
      'Workspaces fetched successfully'
    ).send(res);
  }
);

export const deleteWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await deleteWorkspaceService(req.params.workspaceId, req.user!);
    return new ApiResponse(
      StatusCodes.OK,
      result,
      'Workspace deleted successfully'
    ).send(res);
  }
);

export const getWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspace = await getWorkspaceService(req.params.workspaceId, req.user!);
    return new ApiResponse(
      StatusCodes.OK,
      workspace,
      'Workspace fetched successfully'
    ).send(res);
  }
);

export const getWorkspaceByJoinCodeController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspace = await getWorkspaceByJoinCodeService(
      req.params.joinCode,
      req.user!
    );
    return new ApiResponse(
      StatusCodes.OK,
      workspace,
      'Workspace fetched successfully'
    ).send(res);
  }
);

export const updateWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspace = await updateWorkspaceService(
      req.params.workspaceId,
      req.body as { name?: string; description?: string },
      req.user!
    );
    return new ApiResponse(
      StatusCodes.OK,
      workspace,
      'Workspace updated successfully'
    ).send(res);
  }
);

export const addMemberToWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const { memberId, role } = req.body as { memberId: string; role?: 'admin' | 'member' };
    const workspace = await addMemberToWorkspaceService(
      req.params.workspaceId,
      memberId,
      role ?? 'member',
      req.user!
    );
    return new ApiResponse(
      StatusCodes.OK,
      workspace,
      'Member added to workspace successfully'
    ).send(res);
  }
);

export const addChannelToWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const { channelName } = req.body as { channelName: string };
    const workspace = await addChannelToWorkspaceService(
      req.params.workspaceId,
      channelName,
      req.user!
    );
    return new ApiResponse(
      StatusCodes.OK,
      workspace,
      'Channel added to workspace successfully'
    ).send(res);
  }
);

export const resetJoinCodeController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspace = await resetWorkspaceJoinCodeService(
      req.params.workspaceId,
      req.user!
    );
    return new ApiResponse(
      StatusCodes.OK,
      workspace,
      'Join code reset successfully'
    ).send(res);
  }
);

export const joinWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const { joinCode } = req.body as { joinCode: string };
    const workspace = await joinWorkspaceService(
      req.params.workspaceId,
      joinCode,
      req.user!
    );
    return new ApiResponse(
      StatusCodes.OK,
      workspace,
      'Joined workspace successfully'
    ).send(res);
  }
);

export const verifyEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await verifyTokenService(req.params.token);
    return new ApiResponse(
      StatusCodes.OK,
      user,
      'Email verified successfully'
    ).send(res);
  }
);
