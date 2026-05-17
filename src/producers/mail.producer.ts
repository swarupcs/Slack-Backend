import { logger } from '../lib/logger';
import mailQueue from '../queues/mail.queue';

interface EmailData {
  from?: string;
  to?: string;
  subject: string;
  text: string;
}

/**
 * Add an email job to the mail queue.
 */
export async function addEmailToMailQueue(emailData: EmailData): Promise<void> {
  logger.info('Queuing email for delivery');

  try {
    await mailQueue.add(emailData);
    logger.info('Email added to mail queue');
  } catch (error) {
    logger.error('Failed to add email to mail queue:', error);
  }
}
