import { StatusCodes } from 'http-status-codes';
import type { Types } from 'mongoose';

import User from '../models/user.model';
import Workspace from '../models/workspace.model';
import type {
  IWorkspaceDocument,
  IWorkspacePopulated
} from '../types/model.types';
import type { WorkspaceRole } from '../types/model.types';
import { ApiError } from '../utils/ApiError';
import channelRepository from './channel.repository';
import crudRepository from './crud.repository';

const workspaceRepository = {
  ...crudRepository(Workspace),

  /**
   * Get workspace with members and channels populated.
   */
  async getWorkspaceDetailsById(
    workspaceId: string
  ): Promise<IWorkspacePopulated | null> {
    return Workspace.findById(workspaceId)
      .populate('members.memberId', 'username email avatar')
      .populate('channels') as unknown as Promise<IWorkspacePopulated | null>;
  },

  /**
   * Find workspace by name.
   */
  async getWorkspaceByName(
    workspaceName: string
  ): Promise<IWorkspaceDocument | null> {
    const workspace = await Workspace.findOne({ name: workspaceName });

    if (!workspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
    }

    return workspace;
  },

  /**
   * Find workspace by join code.
   */
  async getWorkspaceByJoinCode(
    joinCode: string
  ): Promise<IWorkspaceDocument | null> {
    const workspace = await Workspace.findOne({ joinCode });

    if (!workspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
    }

    return workspace;
  },

  /**
   * Add a member to a workspace.
   */
  async addMemberToWorkspace(
    workspaceId: string,
    memberId: string,
    role: WorkspaceRole | string
  ): Promise<IWorkspaceDocument> {
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
    }

    const isValidUser = await User.findById(memberId);
    if (!isValidUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    const isMemberAlreadyInWorkspace = workspace.members.find(
      (member) => member.memberId.toString() === memberId
    );

    if (isMemberAlreadyInWorkspace) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'User is already a member of this workspace'
      );
    }

    workspace.members.push({
      memberId: isValidUser._id as Types.ObjectId,
      role: role as WorkspaceRole
    });

    await workspace.save();
    return workspace;
  },

  /**
   * Add a channel to a workspace.
   */
  async addChannelToWorkspace(
    workspaceId: string,
    channelName: string
  ): Promise<IWorkspaceDocument> {
    const workspace = await Workspace.findById(workspaceId).populate(
      'channels'
    );

    if (!workspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
    }

    const channels = workspace.channels as unknown as { name: string }[];
    const isChannelExists = channels.find(
      (channel) => channel.name === channelName
    );

    if (isChannelExists) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Channel already exists in this workspace'
      );
    }

    const channel = await channelRepository.create({
      name: channelName,
      workspaceId: workspace._id as Types.ObjectId
    });

    (workspace.channels as Types.ObjectId[]).push(channel._id as Types.ObjectId);
    await workspace.save();

    return workspace;
  },

  /**
   * Fetch all workspaces a user is a member of.
   */
  async fetchAllWorkspaceByMemberId(
    memberId: string
  ): Promise<IWorkspacePopulated[]> {
    return Workspace.find({
      'members.memberId': memberId
    }).populate(
      'members.memberId',
      'username email avatar'
    ) as unknown as Promise<IWorkspacePopulated[]>;
  }
};

export default workspaceRepository;
