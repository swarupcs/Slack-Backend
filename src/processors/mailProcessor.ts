import { Job } from 'bull';

import transporter from '../config/mailConfig';
import { MailOptions } from '../types/index';
import mailQueue from '../queues/mailQueue';

/**
 * Mail queue processor.
 * Reads jobs from the mailQueue and sends them via the Nodemailer transporter.
 * Failures are retried automatically per the queue's defaultJobOptions.
 */
mailQueue.process(async (job: Job<MailOptions>): Promise<void> => {
  const emailData = job.data;
  console.info(`[MailProcessor] Processing job ${job.id} → ${emailData.to ?? 'unknown'}`);

  try {
    const info = await transporter.sendMail(emailData);
    console.info(`[MailProcessor] Email sent: ${info.messageId}`);
  } catch (error) {
    console.error(`[MailProcessor] Failed to send email for job ${job.id}:`, error);
    // Re-throw so Bull marks the job as failed and applies retry logic
    throw error;
  }
});

mailQueue.on('failed', (job: Job<MailOptions>, err: Error) => {
  console.error(
    `[MailQueue] Job ${job.id} permanently failed after ${job.attemptsMade} attempts:`,
    err.message
  );
});
