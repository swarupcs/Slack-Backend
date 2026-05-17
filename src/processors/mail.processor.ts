import type { Job } from 'bull';

import mailer from '../config/mail.config';
import { logger } from '../lib/logger';
import mailQueue from '../queues/mail.queue';

interface EmailJobData {
  from?: string;
  to?: string;
  subject: string;
  text: string;
}

/**
 * Process mail queue jobs.
 */
mailQueue.process(async (job: Job<EmailJobData>) => {
  const emailData = job.data;
  logger.info(`Processing email to: ${emailData.to}`);

  try {
    const response = await mailer.sendMail(emailData);
    logger.info(`Email sent successfully: ${response.messageId}`);
  } catch (error) {
    logger.error('Error processing email:', error);
    throw error; // Re-throw so Bull can handle retries
  }
});
