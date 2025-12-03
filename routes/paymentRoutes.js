import express from 'express';
import {
  createPaymentIntent,
  confirmPayPalPayment,
  confirmCryptoPayment,
  confirmBankTransfer,
  getPendingPayments,
  approvePayment,
  updatePaymentConfig
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Rutas de usuario (requieren autenticación)
router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm-paypal', protect, confirmPayPalPayment);
router.post('/confirm-crypto', protect, confirmCryptoPayment);
router.post('/confirm-bank', protect, confirmBankTransfer);

// Rutas de admin (requieren autenticación + rol admin)
router.get('/pending', protect, admin, getPendingPayments);
router.post('/approve', protect, admin, approvePayment);
router.put('/config', protect, admin, updatePaymentConfig);

export default router;
