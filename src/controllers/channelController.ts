import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { getChannelByIdService } from '../services/channelService';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getChannelByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const channel = await getChannelByIdService(req.params.channelId, req.user!);
    return new ApiResponse(StatusCodes.OK, channel, 'Channel fetched successfully').send(res);
  }
);
