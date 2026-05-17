import { StatusCodes } from 'http-status-codes';

import { getChannelByIdService } from '../services/channel.service';
import type { AuthenticatedRequest } from '../types/express.types';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * GET /api/v1/channels/:channelId
 */
export const getChannelByIdController = asyncHandler(async (req, res) => {
  const channelId = req.params.channelId as string;
  const response = await getChannelByIdService(
    channelId,
    (req as AuthenticatedRequest).user
  );

  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(StatusCodes.OK, response, 'Channel fetched successfully')
    );
});
