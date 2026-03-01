import nodemailer, { Transporter } from 'nodemailer';

import { MAIL_ID, MAIL_PASSWORD } from './serverConfig';

/**
 * Nodemailer transporter singleton.
 * Configured for Gmail SMTP with app password authentication.
 * Swap host/port/secure for other providers (e.g. Mailtrap, SES).
 */
const transporter: Transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: MAIL_ID,
    pass: MAIL_PASSWORD
  },
  pool: true, // Reuse SMTP connections
  maxConnections: 5,
  maxMessages: 100
});

export default transporter;
