import { Notification } from '../models/notification.model.js';
import { getSocketIO } from '../sockets/socket.js';

export class NotificationService {
  /**
   * Create notification, store in MongoDB, and emit real-time WebSocket event
   */
  static async createNotification(data) {
    const { recipient, sender, type, title, message, postId, slug, link } = data;

    const notification = await Notification.create({
      recipient: recipient || null,
      sender: sender || null,
      type: type || 'SYSTEM',
      title: title || 'Notification',
      message,
      postId: postId || null,
      slug: slug || '',
      link: link || (slug ? `/posts/${slug}` : '/notifications')
    });

    const populated = await Notification.findById(notification._id)
      .populate('sender', 'name email avatar role')
      .lean();

    // Real-time socket emission
    try {
      const io = getSocketIO();
      if (io) {
        if (recipient) {
          // Targeted emission to specific user's private room
          io.to(`user_${recipient.toString()}`).emit('notification', populated);
        } else {
          // Global broadcast to all online users
          io.emit('broadcast_announcement', {
            id: populated._id,
            title: populated.title,
            message: populated.message,
            sender: populated.sender?.name || 'Administrator',
            createdAt: populated.createdAt
          });
        }
      }
    } catch {
      // Socket optional
    }

    return populated;
  }

  /**
   * Get notifications for a user (including global broadcasts)
   */
  static async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {
      $or: [{ recipient: userId }, { recipient: null }]
    };

    if (unreadOnly === 'true' || unreadOnly === true) {
      query.read = false;
    }

    const [docs, totalDocs, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('sender', 'name email avatar role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({
        $or: [{ recipient: userId }, { recipient: null }],
        read: false
      })
    ]);

    const totalPages = Math.ceil(totalDocs / limitNum) || 1;

    return {
      docs,
      unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalDocs,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    };
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      $or: [{ recipient: userId }, { recipient: null }]
    });

    if (notification) {
      notification.read = true;
      await notification.save();
    }

    return notification;
  }

  /**
   * Mark all notifications for a user as read
   */
  static async markAllAsRead(userId) {
    await Notification.updateMany(
      {
        $or: [{ recipient: userId }, { recipient: null }],
        read: false
      },
      {
        $set: { read: true }
      }
    );

    return { message: 'All notifications marked as read' };
  }

  /**
   * Clear notifications for a user
   */
  static async clearUserNotifications(userId) {
    await Notification.deleteMany({ recipient: userId });
    return { message: 'Notifications cleared successfully' };
  }
}

