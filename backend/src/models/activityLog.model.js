import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    userEmail: {
      type: String,
      default: 'anonymous'
    },
    role: {
      type: String,
      default: 'guest'
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    entityType: {
      type: String,
      enum: ['AUTH', 'POST', 'COMMENT', 'USER', 'ADMIN', 'SYSTEM'],
      required: true,
      index: true
    },
    entityId: {
      type: String,
      default: null
    },
    method: {
      type: String,
      default: ''
    },
    endpoint: {
      type: String,
      default: ''
    },
    ip: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    },
    statusCode: {
      type: Number,
      default: 200
    },
    requestId: {
      type: String,
      default: ''
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ entityType: 1, action: 1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
