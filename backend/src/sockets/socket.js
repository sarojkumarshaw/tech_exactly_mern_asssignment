import { Server } from 'socket.io';
import { logger } from '../config/logger.js';
import { verifyAccessToken } from '../utils/tokens.js';

let io = null;

export const initSocket = (server, clientOrigin) => {
  io = new Server(server, {
    cors: {
      origin: clientOrigin || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        socket.user = decoded;
      } catch {
        // Allow unauthenticated guest sockets for reading public post updates
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.user?.email || 'guest'})`);

    // If user is authenticated, join their personal room
    if (socket.user?.sub) {
      socket.join(`user_${socket.user.sub}`);

      // If user is admin, join admin room for live activity monitoring
      if (socket.user.role === 'admin') {
        socket.join('admin_room');
      }
    }

    // Join a specific post's live comment stream
    socket.on('join_post', (postId) => {
      socket.join(`post_${postId}`);
    });

    // Leave a specific post room
    socket.on('leave_post', (postId) => {
      socket.leave(`post_${postId}`);
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

export const getSocketIO = () => {
  return io;
};
