import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['payment', 'error', 'instagram', 'email', 'system'],
    required: true
  },
  level: {
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    default: 'info'
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índice para búsquedas rápidas
logSchema.index({ type: 1, createdAt: -1 });
logSchema.index({ user: 1, createdAt: -1 });

const Log = mongoose.model('Log', logSchema);

export default Log;
