import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  plan: {
    type: String,
    enum: ['casual', 'premium', 'golden', 'none'],
    default: 'none'
  },
  planStartDate: {
    type: Date
  },
  planEndDate: {
    type: Date
  },
  smtpConfig: {
    host: String,
    port: Number,
    user: String,
    pass: String,
    configured: {
      type: Boolean,
      default: false
    }
  },
  instagramConfig: {
    username: String,
    accessToken: String,
    businessAccountId: String,
    configured: {
      type: Boolean,
      default: false
    }
  },
  leads: [{
    name: String,
    email: String,
    phone: String,
    business: String,
    location: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  appointments: [{
    title: String,
    date: Date,
    time: String,
    clientName: String,
    clientEmail: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para generar token de recuperación
userSchema.methods.getResetPasswordToken = async function() {
  const crypto = await import('crypto');
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutos
  
  return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
