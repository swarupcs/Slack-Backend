import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { StatusCodes } from 'http-status-codes';
import { Server } from 'socket.io';

import bullServerAdapter from './config/bullBoardConfig';
import connectDB from './config/dbConfig';
import transporter from './config/mailConfig';
import { NODE_ENV, PORT } from './config/serverConfig';
import channelSocketHandlers from './controllers/channelSocketController';
import messageSocketHandlers from './controllers/messageSocketController';
import { verifyEmailController } from './controllers/workspaceController';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import apiRouter from './routes/apiRoutes';
import { ApiResponse } from './utils/ApiResponse';

// ─── App Bootstrap ────────────────────────────────────────────────────────────

const app = express();
const httpServer = createServer(app);

// ─── Socket.IO ────────────────────────────────────────────────────────────────

const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) ?? [],
    credentials: true,
  }
});

// ─── Core Middleware ──────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) ?? [],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'x-access-token'],
    credentials: true   // Required for cookies to be sent cross-origin
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());   // Parses req.cookies so authMiddleware can read 'token' cookie

// ─── Routes ───────────────────────────────────────────────────────────────────

// Bull Board queue monitoring dashboard
app.use('/ui', bullServerAdapter.getRouter());

// Versioned REST API
app.use('/api', apiRouter);

// Email verification link (outside versioned API — used in email links)
app.get('/verify/:token', verifyEmailController);

// Health check
app.get('/ping', (_req: Request, res: Response): void => {
  new ApiResponse(StatusCodes.OK, { env: NODE_ENV }, 'pong').send(res);
});

// 404 — unknown routes
app.use((_req: Request, res: Response): void => {
  new ApiResponse(StatusCodes.NOT_FOUND, null, 'Route not found').send(res);
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(globalErrorHandler);

// ─── Socket.IO Connection ─────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.info(`[Socket] Client connected: ${socket.id}`);
  messageSocketHandlers(io, socket);
  channelSocketHandlers(io, socket);
  socket.on('disconnect', (reason) => {
    console.info(`[Socket] Client disconnected: ${socket.id} — ${reason}`);
  });
});

// ─── Server Startup ───────────────────────────────────────────────────────────

httpServer.listen(PORT, async (): Promise<void> => {
  console.info(`[Server] Running on port ${PORT} (${NODE_ENV})`);

  try {
    await connectDB();
  } catch (err) {
    console.error('[Server] Failed to connect to database:', err);
    process.exit(1);
  }

  transporter.verify((error) => {
    if (error) {
      console.warn('[Mail] Transporter verification failed:', error.message);
    } else {
      console.info('[Mail] Transporter ready');
    }
  });
});

export { app, httpServer, io };
