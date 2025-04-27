import nodemailer from 'nodemailer';

import { MAIL_ID, MAIL_PASSWORD } from './serverConfig.js';

const transporter = nodemailer.createTransport({
  // service: 'Gmail',
  // host: 'smtp.gmail.com',
  host: 'sandbox.smtp.mailtrap.io', // ✅ Mailtrap host
  // port: 465, // for GMAIL
  port: 587, // ✅ Mailtrap port (587)
  secure: false, // ✅ Must be false for port 587
  auth: {
    user: MAIL_ID,
    pass: MAIL_PASSWORD
  }
});

export default transporter;