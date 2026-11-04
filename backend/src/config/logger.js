import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.resolve(__dirname, '../../logs');

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level}: ${stack || message}${metaStr}`;
});

const transports = [
  new winston.transports.Console({
    level: env.LOG_LEVEL,
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      consoleFormat
    )
  })
];

if (env.LOG_TO_FILE) {
  // Error log rotation
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
      maxSize: '20m',
      format: combine(timestamp(), errors({ stack: true }), json())
    })
  );

  // Combined log rotation
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
      format: combine(timestamp(), errors({ stack: true }), json())
    })
  );
}

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(timestamp(), errors({ stack: true }), json()),
  defaultMeta: { service: env.SERVICE_NAME },
  transports,
  exitOnError: false
});

// Dedicated activity logger for audit trails
export const activityLoggerInstance = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), json()),
  defaultMeta: { service: `${env.SERVICE_NAME}-activity` },
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        printf(({ timestamp, message, ...meta }) => `[AUDIT ${timestamp}] ${message} ${JSON.stringify(meta)}`)
      )
    }),
    ...(env.LOG_TO_FILE
      ? [
          new winston.transports.DailyRotateFile({
            filename: path.join(logDir, 'activity-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d',
            maxSize: '20m'
          })
        ]
      : [])
  ]
});

// Stream for morgan HTTP logger
export const morganStream = {
  write: (message) => {
    logger.info(message.trim(), { source: 'http' });
  }
};
