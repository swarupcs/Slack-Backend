import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';

import bullServerAdapter from './config/bull-board.config';
import { corsOptions } from './config/cors.config';
import { verifyEmailController } from './controllers/workspace.controller';
import { globalErrorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/notFound.middleware';
import { rateLimiter } from './middlewares/rateLimiter.middleware';
import { requestLogger } from './middlewares/requestLogger.middleware';
import apiRouter from './routes/api.routes';
import { ApiResponse } from './utils/ApiResponse';

const app: import("express").Application = express();

/* ─── Security Middleware ────────────────────────────────────────────── */
app.use(helmet());
app.use(cors(corsOptions));
app.use(rateLimiter);

/* ─── Body Parsing ───────────────────────────────────────────────────── */
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

/* ─── Request Logging ────────────────────────────────────────────────── */
app.use(requestLogger);

/* ─── Bull Board Dashboard ───────────────────────────────────────────── */
app.use('/ui', bullServerAdapter.getRouter());

/* ─── API Routes ─────────────────────────────────────────────────────── */
app.use('/api', apiRouter);

/* ─── Email Verification Route ───────────────────────────────────────── */
app.get('/verify/:token', verifyEmailController);

/* ─── Health Check ───────────────────────────────────────────────────── */
app.get('/health', (_req, res) => {
  res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    })
  );
});

/* ─── Ping ───────────────────────────────────────────────────────────── */
app.get('/ping', (_req, res) => {
  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, null, 'pong'));
});

/* ─── 404 Handler ────────────────────────────────────────────────────── */
app.use(notFoundHandler);

/* ─── Global Error Handler (must be last) ────────────────────────────── */
app.use(globalErrorHandler);

export default app;
