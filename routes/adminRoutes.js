import express from 'express';
import {
  getAllUsers,
  toggleUserStatus,
  changeUserPlan,
  resetUserPassword,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getLogs,
  getDashboardStats
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol admin
router.use(protect);
router.use(admin);

// Estadísticas
router.get('/stats', getDashboardStats);

// Gestión de usuarios
router.get('/users', getAllUsers);
router.post('/users/toggle-status', toggleUserStatus);
router.put('/users/change-plan', changeUserPlan);
router.put('/users/reset-password', resetUserPassword);

// Gestión de cupones
router.get('/coupons', getAllCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:couponId', updateCoupon);
router.delete('/coupons/:couponId', deleteCoupon);

// Logs
router.get('/logs', getLogs);

export default router;
