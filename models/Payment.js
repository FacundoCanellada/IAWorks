import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['casual', 'premium', 'golden'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'usdc', 'bank_transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  // Para PayPal
  paypalOrderId: String,
  paypalPayerId: String,
  
  // Para USDC
  cryptoTxHash: String,
  cryptoFromAddress: String,
  cryptoToAddress: String,
  
  // Para transferencia bancaria
  bankReference: String,
  bankProof: String, // URL de comprobante subido
  
  // Metadatos
  ipAddress: String,
  userAgent: String,
  
  completedAt: Date,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generar referencia única para transferencia bancaria
paymentSchema.methods.generateBankReference = function() {
  const userId = this.user.toString().slice(-6).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  this.bankReference = `IAW-${userId}-${timestamp}`;
  return this.bankReference;
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
