import { StatusCodes } from 'http-status-codes';

import { verifyTokenService } from '../services/user.service';
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
  updateWorkspaceService,
  createOrGetDMChannelService
} from '../services/workspace.service';
import type { AuthenticatedRequest } from '../types/express.types';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import messageRepository from '../repositories/message.repository';
import { ApiError } from '../utils/ApiError';

/**
 * POST /api/v1/workspaces
 */
export const createWorkspaceController = asyncHandler(async (req, res) => {
  const response = await createWorkspaceService({
    ...req.body,
    owner: (req as AuthenticatedRequest).user
  });

  res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(
        StatusCodes.CREATED,
        response,
        'Workspace created successfully'
      )
    );
});

/**
 * GET /api/v1/workspaces
 */
export const getWorkspacesUserIsMemberOfController = asyncHandler(
  async (req, res) => {
    const response = await getWorkspacesUserIsMemberOfService(
      (req as AuthenticatedRequest).user
    );

    res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          response,
          'Workspaces fetched successfully'
        )
      );
  }
);

/**
 * DELETE /api/v1/workspaces/:workspaceId
 */
export const deleteWorkspaceController = asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId as string;
  const response = await deleteWorkspaceService(
    workspaceId,
    (req as AuthenticatedRequest).user
  );

  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        response,
        'Workspace deleted successfully'
      )
    );
});

/**
 * GET /api/v1/workspaces/:workspaceId
 */
export const getWorkspaceController = asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId as string;
  const response = await getWorkspaceService(
    workspaceId,
    (req as AuthenticatedRequest).user
  );

  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        response,
        'Workspace fetched successfully'
      )
    );
});

/**
 * GET /api/v1/workspaces/join/:joinCode
 */
export const getWorkspaceByJoinCodeController = asyncHandler(
  async (req, res) => {
    const joinCode = req.params.joinCode as string;
    const response = await getWorkspaceByJoinCodeService(
      joinCode,
      (req as AuthenticatedRequest).user
    );

    res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          response,
          'Workspace fetched successfully'
        )
      );
  }
);

/**
 * PUT /api/v1/workspaces/:workspaceId
 */
export const updateWorkspaceController = asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId as string;
  const response = await updateWorkspaceService(
    workspaceId,
    req.body,
    (req as AuthenticatedRequest).user
  );

  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        response,
        'Workspace updated successfully'
      )
    );
});

/**
 * PUT /api/v1/workspaces/:workspaceId/members
 */
export const addMemberToWorkspaceController = asyncHandler(
  async (req, res) => {
    const workspaceId = req.params.workspaceId as string;
    const response = await addMemberToWorkspaceService(
      workspaceId,
      req.body.memberId,
      req.body.role || 'member',
      (req as AuthenticatedRequest).user
    );

    res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          response,
          'Member added to workspace successfully'
        )
      );
  }
);

/**
 * PUT /api/v1/workspaces/:workspaceId/channels
 */
export const addChannelToWorkspaceController = asyncHandler(
  async (req, res) => {
    const workspaceId = req.params.workspaceId as string;
    const response = await addChannelToWorkspaceService(
      workspaceId,
      req.body.channelName,
      (req as AuthenticatedRequest).user
    );

    res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          response,
          'Channel added to workspace successfully'
        )
      );
  }
);

/**
 * PUT /api/v1/workspaces/:workspaceId/joinCode/reset
 */
export const resetJoinCodeController = asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId as string;
  const response = await resetWorkspaceJoinCodeService(
    workspaceId,
    (req as AuthenticatedRequest).user
  );

  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(StatusCodes.OK, response, 'Join code reset successfully')
    );
});

/**
 * PUT /api/v1/workspaces/:workspaceId/join
 */
export const joinWorkspaceController = asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId as string;
  const response = await joinWorkspaceService(
    workspaceId,
    req.body.joinCode,
    (req as AuthenticatedRequest).user
  );

  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        response,
        'Joined workspace successfully'
      )
    );
});

/**
 * GET /verify/:token
 */
export const verifyEmailController = asyncHandler(async (req, res) => {
  const token = req.params.token as string;
  const response = await verifyTokenService(token);

  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        response,
        'Email verified successfully'
      )
    );
});

/**
 * PUT /api/v1/workspaces/:workspaceId/dm
 */
export const createOrGetDMChannelController = asyncHandler(
  async (req, res) => {
    const workspaceId = req.params.workspaceId as string;
    const { memberId } = req.body;
    const response = await createOrGetDMChannelService(
      workspaceId,
      (req as AuthenticatedRequest).user,
      memberId
    );

    res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          response,
          'DM Channel fetched successfully'
        )
      );
  }
);

/**
 * GET /api/v1/workspaces/:workspaceId/search?query=...
 */
export const searchWorkspaceController = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const query = req.query.query as string | undefined;

  if (!query || query.trim().length < 2) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Search query must be at least 2 characters');
  }

  const results = await messageRepository.searchMessages(workspaceId, query.trim());

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, results, 'Search results'));
});
