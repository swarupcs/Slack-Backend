// Import mail processor to register queue processing
import './processors/mail.processor';

import dns from 'node:dns';
// Force Node to use Google DNS to bypass ISP blocking of MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { createServer } from 'http';
import { Server } from 'socket.io';

import app from './app';
import { corsOptions } from './config/cors.config';
import { connectDB, disconnectDB } from './config/db.config';
import { env } from './config/env.config';
import mailer from './config/mail.config';
import channelSocketHandlers from './controllers/channelSocket.controller';
import { setSocketServer } from './controllers/message.controller';
import messageSocketHandlers from './controllers/messageSocket.controller';
import presenceSocketHandlers from './controllers/presenceSocket.controller';
import typingSocketHandlers from './controllers/typingSocket.controller';
import { logger } from './lib/logger';

const server = createServer(app);

/* ─── Socket.IO Setup ────────────────────────────────────────────────── */
const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: corsOptions.methods
  }
});

// Inject io into controllers that need to broadcast
setSocketServer(io);

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  messageSocketHandlers(io, socket);
  channelSocketHandlers(io, socket);
  presenceSocketHandlers(io, socket);
  typingSocketHandlers(io, socket);

  socket.on('disconnect', () => {
    logger.debug(`Socket disconnected: ${socket.id}`);
  });
});

/* ─── Server Startup ─────────────────────────────────────────────────── */
async function bootstrap(): Promise<void> {
  try {
    // Connect to database
    await connectDB();

    // Verify mail transporter
    if (env.MAIL_ID && env.MAIL_PASSWORD) {
      mailer.verify((error) => {
        if (error) {
          logger.warn('Mail transporter verification failed:', error);
        } else {
          logger.info('✅ Mail transporter is ready');
        }
      });
    }

    // Start HTTP server
    server.listen(env.PORT, () => {
      logger.info(`🚀 Server is running on port ${env.PORT}`);
      logger.info(`📡 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${env.PORT}/health`);
      logger.info(
        `📊 Bull Board: http://localhost:${env.PORT}/ui`
      );
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/* ─── Graceful Shutdown ──────────────────────────────────────────────── */
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');

    // Close database connection
    await disconnectDB();

    // Close Socket.IO
    io.close(() => {
      logger.info('Socket.IO server closed');
    });

    logger.info('✅ Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after timeout
  setTimeout(() => {
    logger.error('⚠️ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

/* ─── Process-Level Error Handling ────────────────────────────────────── */
process.on('uncaughtException', (error: Error) => {
  logger.error('UNCAUGHT EXCEPTION 💥:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('UNHANDLED REJECTION 💥:', reason);
  process.exit(1);
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/* ─── Start ──────────────────────────────────────────────────────────── */
bootstrap();
