import { StatusCodes } from 'http-status-codes';

import User from '../schema/user';
import Workspace, { IWorkspaceDocument, IWorkspaceMemberDocument } from '../schema/workspace';
import { ApiError } from '../utils/ApiError';
import channelRepository from './channelRepository';
import crudRepository, { ICrudRepository } from './crudRepository';

// ─── Extended Interface ───────────────────────────────────────────────────────

interface IWorkspaceRepository extends ICrudRepository<IWorkspaceDocument> {
  getWorkspaceDetailsById: (id: string) => Promise<IWorkspaceDocument | null>;
  getWorkspaceByName: (name: string) => Promise<IWorkspaceDocument>;
  getWorkspaceByJoinCode: (joinCode: string) => Promise<IWorkspaceDocument>;
  addMemberToWorkspace: (
    workspaceId: string,
    memberId: string,
    role: 'admin' | 'member'
  ) => Promise<IWorkspaceDocument>;
  addChannelToWorkspace: (
    workspaceId: string,
    channelName: string
  ) => Promise<IWorkspaceDocument>;
  fetchAllWorkspacesByMemberId: (memberId: string) => Promise<IWorkspaceDocument[]>;
}

// ─── Repository ───────────────────────────────────────────────────────────────

const workspaceRepository: IWorkspaceRepository = {
  ...crudRepository<IWorkspaceDocument>(Workspace),

  getWorkspaceDetailsById: (id: string): Promise<IWorkspaceDocument | null> =>
    Workspace.findById(id)
      .populate('members.memberId', 'username email avatar')
      .populate('channels'),

  getWorkspaceByName: async (name: string): Promise<IWorkspaceDocument> => {
    const workspace = await Workspace.findOne({ name });
    if (!workspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
    }
    return workspace;
  },

  getWorkspaceByJoinCode: async (joinCode: string): Promise<IWorkspaceDocument> => {
    const workspace = await Workspace.findOne({ joinCode: joinCode.toUpperCase() });
    if (!workspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
    }
    return workspace;
  },

  addMemberToWorkspace: async (
    workspaceId: string,
    memberId: string,
    role: 'admin' | 'member'
  ): Promise<IWorkspaceDocument> => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
    }

    const userExists = await User.exists({ _id: memberId });
    if (!userExists) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    const alreadyMember = workspace.members.some(
      (m) => m.memberId.toString() === memberId
    );
    if (alreadyMember) {
      throw new ApiError(StatusCodes.CONFLICT, 'User already part of workspace');
    }

    workspace.members.push({ memberId, role } as unknown as IWorkspaceMemberDocument);
    await workspace.save();
    return workspace;
  },

  addChannelToWorkspace: async (
    workspaceId: string,
    channelName: string
  ): Promise<IWorkspaceDocument> => {
    const workspace = await Workspace.findById(workspaceId).populate('channels');
    if (!workspace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
    }

    const duplicate = (workspace.channels as unknown as { name: string }[]).find(
      (ch) => ch.name.toLowerCase() === channelName.toLowerCase()
    );
    if (duplicate) {
      throw new ApiError(StatusCodes.CONFLICT, 'Channel already part of workspace');
    }

    const channel = await channelRepository.create({
      name: channelName.toLowerCase(),
      workspaceId
    });

    workspace.channels.push(channel._id);
    await workspace.save();
    return workspace;
  },

  fetchAllWorkspacesByMemberId: (memberId: string): Promise<IWorkspaceDocument[]> =>
    Workspace.find({ 'members.memberId': memberId }).populate(
      'members.memberId',
      'username email avatar'
    )
};

export default workspaceRepository;
