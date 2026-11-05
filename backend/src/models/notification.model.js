import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // null indicates global announcement for all users
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    type: {
      type: String,
      enum: [
        'COMMENT_ON_POST',
        'COMMENT_POSTED',
        'NEW_POST',
        'ANNOUNCEMENT',
        'POST_MODERATED',
        'POST_RESTORED',
        'SYSTEM',
        'TEST_ALERT'
      ],
      default: 'SYSTEM',
      index: true
    },
    title: {
      type: String,
      trim: true,
      default: 'Notification'
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    slug: {
      type: String,
      trim: true
    },
    link: {
      type: String,
      trim: true
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
