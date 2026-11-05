import { Server } from 'socket.io';
import { logger } from '../config/logger.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { NotificationService } from '../services/notification.service.js';

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
    const userId = socket.user?.sub || socket.user?._id || socket.user?.id;
    if (userId) {
      socket.join(`user_${userId}`);
      logger.info(`Socket ${socket.id} joined room: user_${userId}`);

      // If user is admin, join admin room for live activity monitoring
      if (socket.user.role === 'admin') {
        socket.join('admin_room');
        logger.info(`Socket ${socket.id} joined admin_room`);
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

    // 2. Trigger notification (Supports both Global Broadcast and Self-Test)
    socket.on('trigger_test_notification', async (data) => {
      const notifData = {
        id: Date.now(),
        type: data?.type || 'TEST_ALERT',
        title: data?.title || 'Real-Time Alert',
        message: data?.message || '🧪 Real-time test alert triggered successfully via Socket.io!',
        createdAt: new Date().toISOString()
      };

      const userId = socket.user?.sub || socket.user?._id || socket.user?.id;
      const isBroadcast = data?.broadcast === true || data?.target === 'all' || socket.user?.role === 'admin';

      if (isBroadcast) {
        // Broadcast to ALL users (Admin + Regular Users) and persist to MongoDB
        try {
          const dbNotif = await NotificationService.createNotification({
            recipient: null, // Global
            sender: userId || null,
            type: data?.type || 'ANNOUNCEMENT',
            title: notifData.title,
            message: notifData.message,
            link: '/notifications'
          });
          notifData._id = dbNotif._id;
        } catch {
          // Socket fallback
        }

        io.emit('notification', notifData);
        io.emit('broadcast_announcement', {
          id: notifData._id || notifData.id,
          title: notifData.title,
          message: notifData.message,
          sender: socket.user?.name || 'Administrator',
          createdAt: notifData.createdAt
        });
      } else {
        // Self-test for single client
        if (userId) {
          try {
            const dbNotif = await NotificationService.createNotification({
              recipient: userId,
              sender: userId,
              type: data?.type || 'TEST_ALERT',
              title: notifData.title,
              message: notifData.message,
              link: '/notifications'
            });
            notifData._id = dbNotif._id;
          } catch {
            // Socket fallback
          }
        }
        socket.emit('notification', notifData);
      }
    });

    // 3. Admin Global Broadcast
    socket.on('trigger_admin_broadcast', async (data) => {
      if (socket.user?.role !== 'admin') {
        return socket.emit('error_message', { message: 'Unauthorized: Admin role required for global broadcast' });
      }

      const userId = socket.user?.sub || socket.user?._id || socket.user?.id;
      try {
        const notif = await NotificationService.createNotification({
          recipient: null, // Broadcast to all online users
          sender: userId,
          type: 'ANNOUNCEMENT',
          title: data?.title || 'System Announcement',
          message: data?.message || 'This is a live real-time broadcast from the Admin Console.',
          link: '/notifications'
        });
        io.emit('notification', notif);
      } catch (err) {
        logger.error(`Broadcast announcement error: ${err.message}`);
        const fallback = {
          id: Date.now(),
          type: 'ANNOUNCEMENT',
          title: data?.title || 'System Announcement',
          message: data?.message || 'This is a live real-time broadcast from the Admin Console.',
          sender: socket.user?.name || 'Administrator',
          createdAt: new Date().toISOString()
        };
        io.emit('broadcast_announcement', fallback);
        io.emit('notification', fallback);
      }
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
