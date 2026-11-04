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

    // ⚡ INTERACTIVE TESTING CAPABILITIES FOR DEMOS & EVALUATION ⚡

    // 1. Ping-pong latency test
    socket.on('client_ping', (data) => {
      socket.emit('server_pong', {
        clientTime: data?.clientTime || Date.now(),
        serverTime: Date.now(),
        socketId: socket.id
      });
    });

    // 2. Trigger test notification to self
    socket.on('trigger_test_notification', (data) => {
      socket.emit('notification', {
        id: Date.now(),
        type: 'TEST_ALERT',
        message: data?.message || '🧪 Real-time test alert triggered successfully via Socket.io!',
        createdAt: new Date().toISOString()
      });
    });

    // 3. Admin Global Broadcast
    socket.on('trigger_admin_broadcast', (data) => {
      if (socket.user?.role !== 'admin') {
        return socket.emit('error_message', { message: 'Unauthorized: Admin role required for global broadcast' });
      }

      io.emit('broadcast_announcement', {
        id: Date.now(),
        title: data?.title || 'System Announcement',
        message: data?.message || 'This is a live real-time broadcast from the Admin Console.',
        sender: socket.user?.name || 'Administrator',
        createdAt: new Date().toISOString()
      });
    });

    // 4. Simulate Activity Log for Admin Room
    socket.on('trigger_simulated_activity', (data) => {
      if (socket.user?.role !== 'admin') return;

      const dummyLog = {
        _id: 'test_' + Date.now(),
        action: data?.action || 'SIMULATED_TEST_EVENT',
        entityType: 'SYSTEM',
        userEmail: socket.user?.email || 'admin@example.com',
        ip: socket.handshake.address || '127.0.0.1',
        endpoint: '/socket/simulated-test',
        statusCode: 200,
        createdAt: new Date().toISOString()
      };

      io.to('admin_room').emit('activity_log', dummyLog);
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
