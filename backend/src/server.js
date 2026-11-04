import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './config/logger.js';
import { initSocket } from './sockets/socket.js';

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    // Initialize Socket.io
    initSocket(server, env.CLIENT_URL);

    server.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      logger.info(`API Health check available at: http://localhost:${env.PORT}/api/v1/health`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      logger.warn(`${signal} signal received. Closing HTTP server and database connections...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });

      // Force close if hangs
      setTimeout(() => {
        logger.error('Force shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection:', {
        reason: reason instanceof Error ? reason.message : reason,
        stack: reason instanceof Error ? reason.stack : undefined
      });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', {
        message: error.message,
        stack: error.stack
      });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Server startup failure:', error);
    process.exit(1);
  }
};

startServer();

