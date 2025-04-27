import express from 'express';
import { StatusCodes } from 'http-status-codes';

import connectDB from './config/dbConfig.js';
import mailer from './config/mailConfig.js';
import { PORT } from './config/serverConfig.js';
import apiRouter from './routes/apiRoutes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);

app.get('/ping', (req, res) => {
  return res.status(StatusCodes.OK).json({ message: 'pong' });
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();

  // Verify transporter before sending mail
  mailer.verify(function (error) {
    if (error) {
      console.error('Error verifying transporter:', error);
    } else {
      console.log('Server is ready to take our messages');
    }
  });

  // Configure the mailoptions object
  const mailOptions = {
    from: 'yourusername@email.com',
    to: 'yourfriend@email.com',
    subject: 'Sending Email using Node.js',
    text: 'Welcome to the App'
  };

  // console.log('mailer: ', mailer);

  // Send the email
  try {
    // 🔥 await sending the mail
    const info = await mailer.sendMail(mailOptions);
    console.log('Email sent: ', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
});
