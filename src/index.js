import express from 'express';
import { StatusCodes } from 'http-status-codes';
import Redis from 'ioredis';

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

// const FROM_MAIL_ID = process.env.MAIL_ID || '';
// const TO_MAIL_ID = process.env.TO_MAIL_ID || '';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: 5,
  retryStrategy: (times) => Math.min(times * 50, 2000)
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('reconnecting', () => {
  console.log('Reconnecting to Redis');
});

redis.on('close', () => {
  console.log('Redis connection closed');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

// Check Redis status via a custom route (optional)
app.get('/redis-status', async (req, res) => {
  try {
    // Ping the Redis server
    const pong = await redis.ping();
    res.status(StatusCodes.OK).json({ message: 'Redis is connected', ping: pong });
  } catch (error) {
    console.error('Error while pinging Redis:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to connect to Redis' });
  }
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
  // const mailOptions = {
  //   from: FROM_MAIL_ID,
  //   to: TO_MAIL_ID,
  //   subject: 'Sending Email using Node.js',
  //   text: 'Welcome to the App'
  // };

  // console.log('mailer: ', mailer);
  // console.log('mailOptions: ', mailOptions);

  // Send the email
  // try {
  //   // 🔥 await sending the mail
  //   const info = await mailer.sendMail(mailOptions);
  //   console.log('Email sent: ', info.response);
  // } catch (error) {
  //   console.error('Error sending email:', error);
  // }
});
