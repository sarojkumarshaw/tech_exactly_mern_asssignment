import mongoose from 'mongoose';

const errorLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    service: {
      type: String,
      default: 'mern-blog-api'
    },
    environment: {
      type: String,
      default: 'development'
    },
    statusCode: {
      type: Number,
      default: 500,
      index: true
    },
    errorCode: {
      type: String,
      default: 'INTERNAL_SERVER_ERROR'
    },
    message: {
      type: String,
      required: true
    },
    stack: {
      type: String,
      default: ''
    },
    endpoint: {
      type: String,
      default: ''
    },
    method: {
      type: String,
      default: ''
    },
    ip: {
      type: String,
      default: ''
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    requestId: {
      type: String,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

errorLogSchema.index({ createdAt: -1 });

export const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

