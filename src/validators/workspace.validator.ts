import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, 'Workspace name must be at least 3 characters')
    .max(50, 'Workspace name must be at most 50 characters')
    .trim(),
  description: z.string().max(500).optional()
});

export const addMemberToWorkspaceSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  role: z.enum(['admin', 'member']).optional().default('member')
});

export const addChannelToWorkspaceSchema = z.object({
  channelName: z
    .string()
    .min(1, 'Channel name is required')
    .max(80, 'Channel name must be at most 80 characters')
    .trim()
});

export const joinWorkspaceSchema = z.object({
  joinCode: z.string().min(1, 'Join code is required')
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type AddMemberInput = z.infer<typeof addMemberToWorkspaceSchema>;
export type AddChannelInput = z.infer<typeof addChannelToWorkspaceSchema>;
export type JoinWorkspaceInput = z.infer<typeof joinWorkspaceSchema>;
