// Import processor so it's registered before any jobs are added
import '../processors/mailProcessor';

import mailQueue from '../queues/mailQueue';
import { MailOptions } from '../types/index';

/**
 * Enqueues an email job in the mail queue.
 * The processor picks it up asynchronously, decoupling mail delivery from
 * the HTTP request/response cycle.
 */
export const addEmailToMailQueue = async (
  emailData: MailOptions
): Promise<void> => {
  console.info(`[MailProducer] Enqueuing email → ${emailData.to ?? 'unknown'}`);
  try {
    await mailQueue.add(emailData);
    console.info('[MailProducer] Email job added to queue');
  } catch (error) {
    // Log but don't throw — mail failure should not break the primary flow
    console.error('[MailProducer] Failed to enqueue email:', error);
  }
};
