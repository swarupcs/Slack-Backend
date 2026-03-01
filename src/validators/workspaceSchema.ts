import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z
    .string({ required_error: 'Workspace name is required' })
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim()
});

export const addMemberToWorkspaceSchema = z.object({
  memberId: z
    .string({ required_error: 'Member ID is required' })
    .length(24, 'Invalid member ID'),
  role: z.enum(['admin', 'member']).optional().default('member')
});

export const addChannelToWorkspaceSchema = z.object({
  channelName: z
    .string({ required_error: 'Channel name is required' })
    .min(1, 'Channel name cannot be empty')
    .max(80, 'Channel name cannot exceed 80 characters')
    .trim()
    .toLowerCase()
});

export const joinWorkspaceSchema = z.object({
  joinCode: z
    .string({ required_error: 'Join code is required' })
    .min(6, 'Invalid join code')
    .max(6, 'Invalid join code')
    .toUpperCase()
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type AddMemberToWorkspaceInput = z.infer<typeof addMemberToWorkspaceSchema>;
export type AddChannelToWorkspaceInput = z.infer<typeof addChannelToWorkspaceSchema>;
export type JoinWorkspaceInput = z.infer<typeof joinWorkspaceSchema>;
