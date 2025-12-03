import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  updateSMTP,
  updateInstagram,
  checkAdminExists,
  createFirstAdmin
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/register', [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
], login);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Email inválido')
], forgotPassword);

router.put('/reset-password/:resetToken', [
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], resetPassword);

// Verificar si existe admin (ruta pública para setup inicial)
router.get('/admin/exists', checkAdminExists);

// Crear primer admin (solo si no existe ninguno)
router.post('/admin/create-first', [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('adminKey').notEmpty().withMessage('La clave de administrador es obligatoria')
], createFirstAdmin);

// Rutas protegidas (requieren autenticación)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, [
  body('currentPassword').notEmpty().withMessage('La contraseña actual es obligatoria'),
  body('newPassword').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
], updatePassword);

// Configuraciones de usuario
router.put('/smtp', protect, updateSMTP);
router.put('/instagram', protect, updateInstagram);

export default router;
