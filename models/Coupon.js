import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  expiryDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxUses: {
    type: Number,
    default: null // null = ilimitado
  },
  currentUses: {
    type: Number,
    default: 0
  },
  applicablePlans: [{
    type: String,
    enum: ['casual', 'premium', 'golden']
  }],
  affiliate: {
    name: String,
    email: String,
    commissionPercentage: Number
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Método para validar cupón
couponSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  if (new Date() > this.expiryDate) return false;
  if (this.maxUses && this.currentUses >= this.maxUses) return false;
  return true;
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
