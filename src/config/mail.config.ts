import nodemailer from 'nodemailer';

import { env } from './env.config';

/**
 * Nodemailer transporter configured for Gmail SMTP.
 */
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: env.MAIL_ID,
    pass: env.MAIL_PASSWORD
  }
});

export default transporter;
