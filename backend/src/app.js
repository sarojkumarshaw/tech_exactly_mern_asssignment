import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { morganStream } from './config/logger.js';
import { requestIdMiddleware } from './middleware/requestId.middleware.js';
import { globalLimiter } from './middleware/rateLimiter.middleware.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import passport from './config/passport.js';
import v1Router from './routes/index.js';

const app = express();

// Disable x-powered-by header
app.disable('x-powered-by');

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: Not allowed by Access-Control-Allow-Origin'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id']
  })
);

// Request tracking ID
app.use(requestIdMiddleware);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(passport.initialize());

// HTTP request logging
if (env.NODE_ENV !== 'test') {
  app.use(
    morgan(':remote-addr :method :url :status :res[content-length] - :response-time ms', {
      stream: morganStream
    })
  );
}

// Global Rate Limiting
app.use('/api', globalLimiter);

// API Version 1 Routes
app.use('/api/v1', v1Router);

// 404 Handler
app.use(notFoundHandler);

// Centralized Error Handler (Catches all sync & async errors)
app.use(errorHandler);

export default app;

