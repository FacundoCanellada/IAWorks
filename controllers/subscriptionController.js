import User from '../models/User.js';

// Obtener información del plan actual del usuario
export const getCurrentPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: {
        plan: user.plan,
        planStatus: user.planStatus,
        planStartDate: user.planStartDate,
        planEndDate: user.planEndDate,
        paymentMethod: user.paymentMethod,
        daysRemaining: user.planEndDate ? Math.ceil((new Date(user.planEndDate) - new Date()) / (1000 * 60 * 60 * 24)) : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del plan',
      error: error.message
    });
  }
};

// Activar suscripción (después de pago exitoso)
export const activateSubscription = async (req, res) => {
  try {
    const { planType, paymentMethod, subscriptionId, customerId } = req.body;
    
    // Validar plan
    const validPlans = ['casual', 'premium', 'golden'];
    if (!validPlans.includes(planType)) {
      return res.status(400).json({
        success: false,
        message: 'Plan inválido'
      });
    }
    
    const user = await User.findById(req.user.id);
    
    // Calcular fechas de suscripción (30 días)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    // Actualizar usuario con nueva suscripción
    user.plan = planType;
    user.planStatus = 'active';
    user.planStartDate = startDate;
    user.planEndDate = endDate;
    user.paymentMethod = paymentMethod;
    
    if (paymentMethod === 'stripe') {
      user.stripeCustomerId = customerId;
      user.stripeSubscriptionId = subscriptionId;
    } else if (paymentMethod === 'paypal') {
      user.paypalSubscriptionId = subscriptionId;
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: `Plan ${planType} activado exitosamente`,
      data: {
        plan: user.plan,
        planStatus: user.planStatus,
        planStartDate: user.planStartDate,
        planEndDate: user.planEndDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al activar suscripción',
      error: error.message
    });
  }
};

// Cancelar suscripción
export const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.plan === 'none') {
      return res.status(400).json({
        success: false,
        message: 'No tienes ninguna suscripción activa'
      });
    }
    
    // Marcar como cancelada pero mantener activa hasta el final del período
    user.planStatus = 'cancelled';
    
    await user.save();
    
    // TODO: Cancelar en Stripe o PayPal según corresponda
    
    res.json({
      success: true,
      message: 'Suscripción cancelada. Tendrás acceso hasta el final de tu período de facturación'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cancelar suscripción',
      error: error.message
    });
  }
};

// Renovar suscripción
export const renewSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.plan === 'none') {
      return res.status(400).json({
        success: false,
        message: 'No tienes ningún plan para renovar'
      });
    }
    
    // Extender 30 días desde la fecha actual
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + 30);
    
    user.planEndDate = newEndDate;
    user.planStatus = 'active';
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Suscripción renovada exitosamente',
      data: {
        planEndDate: user.planEndDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al renovar suscripción',
      error: error.message
    });
  }
};

// Cambiar de plan
export const changePlan = async (req, res) => {
  try {
    const { newPlan } = req.body;
    
    const validPlans = ['casual', 'premium', 'golden'];
    if (!validPlans.includes(newPlan)) {
      return res.status(400).json({
        success: false,
        message: 'Plan inválido'
      });
    }
    
    const user = await User.findById(req.user.id);
    
    if (user.plan === newPlan) {
      return res.status(400).json({
        success: false,
        message: 'Ya estás suscrito a este plan'
      });
    }
    
    const oldPlan = user.plan;
    user.plan = newPlan;
    
    await user.save();
    
    res.json({
      success: true,
      message: `Plan cambiado de ${oldPlan} a ${newPlan} exitosamente`,
      data: {
        plan: user.plan
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar plan',
      error: error.message
    });
  }
};

// Verificar y actualizar planes expirados (cron job)
export const checkExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    
    // Buscar usuarios con planes expirados
    const expiredUsers = await User.find({
      planStatus: 'active',
      planEndDate: { $lt: now }
    });
    
    // Actualizar estado a expirado
    for (const user of expiredUsers) {
      user.planStatus = 'expired';
      await user.save();
      
      console.log(`Plan expirado para usuario: ${user.email}`);
      // TODO: Enviar email de notificación
    }
    
    console.log(`${expiredUsers.length} suscripciones marcadas como expiradas`);
  } catch (error) {
    console.error('Error al verificar suscripciones expiradas:', error);
  }
};
