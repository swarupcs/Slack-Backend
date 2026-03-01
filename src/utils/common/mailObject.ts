import { APP_LINK, MAIL_ID } from '../../config/serverConfig';
import { IWorkspace, MailOptions } from '../../types/index';

/**
 * Builds the mail payload sent to a newly added workspace member.
 */
export const workspaceJoinMail = (workspace: IWorkspace): Omit<MailOptions, 'to'> => ({
  from: MAIL_ID,
  subject: 'You have been added to a workspace',
  text: `Congratulations! You have been added to the workspace "${workspace.name}". Sign in to get started.`
});

/**
 * Builds the email verification mail payload.
 */
export const verifyEmailMail = (
  verificationToken: string
): Omit<MailOptions, 'to'> => ({
  from: MAIL_ID,
  subject: 'Welcome — please verify your email',
  text: `
    Welcome! Please verify your email by clicking the link below:
    ${APP_LINK}/verify/${verificationToken}

    This link expires in 1 hour.
  `.trim()
});
