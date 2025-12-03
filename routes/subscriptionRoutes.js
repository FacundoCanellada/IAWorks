import express from 'express';
import {
  getCurrentPlan,
  activateSubscription,
  cancelSubscription,
  renewSubscription,
  changePlan
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Obtener plan actual
router.get('/current', getCurrentPlan);

// Activar suscripción (después de pago)
router.post('/activate', activateSubscription);

// Cancelar suscripción
router.post('/cancel', cancelSubscription);

// Renovar suscripción
router.post('/renew', renewSubscription);

// Cambiar de plan
router.put('/change', changePlan);

export default router;
