import { env } from '../config/env.config';

interface MailOptions {
  from: string | undefined;
  to?: string;
  subject: string;
  text: string;
}

/**
 * Build workspace join notification email.
 */
export function workspaceJoinMail(workspace: { name: string }): MailOptions {
  return {
    from: env.MAIL_ID,
    subject: 'You have been added to a workspace',
    text: `Congratulations! You have been added to the workspace ${workspace.name}`
  };
}

/**
 * Build email verification email.
 */
export function verifyEmailMail(verificationToken: string): MailOptions {
  return {
    from: env.MAIL_ID,
    subject: 'Welcome to the app. Please verify your email',
    text: `Welcome to the app. Please verify your email by clicking on the link below:\n${env.APP_LINK}/verify/${verificationToken}`
  };
}
