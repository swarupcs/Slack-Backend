import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

/**
 * Custom log format for development.
 */
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    const msg = stack || message;
    return `[${ts}] ${level}: ${msg}`;
  })
);

/**
 * JSON log format for production.
 */
const prodFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  winston.format.json()
);

const isProd = process.env.NODE_ENV === 'production';

/**
 * Structured logger instance using Winston.
 * - Development: colorized, human-readable console output
 * - Production: JSON format for log aggregation
 */
export const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: isProd ? prodFormat : devFormat,
  defaultMeta: { service: 'slack-backend' },
  transports: [
    new winston.transports.Console(),
    // Production: write errors to file
    ...(isProd
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880,
            maxFiles: 5
          })
        ]
      : [])
  ],
  // Don't exit on unhandled errors
  exitOnError: false
});
