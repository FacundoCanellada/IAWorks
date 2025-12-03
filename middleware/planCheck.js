// Middleware para verificar acceso según plan de suscripción

// Definición de características por plan
const planFeatures = {
  casual: {
    leadsExtraction: true,
    emailMarketing: false,
    instagramSetter: false,
    autoAgenda: false
  },
  premium: {
    leadsExtraction: true,
    emailMarketing: true,
    instagramSetter: false,
    autoAgenda: false
  },
  golden: {
    leadsExtraction: true,
    emailMarketing: true,
    instagramSetter: true,
    autoAgenda: true
  },
  none: {
    leadsExtraction: false,
    emailMarketing: false,
    instagramSetter: false,
    autoAgenda: false
  }
};

// Middleware para verificar si el usuario tiene un plan activo
export const requireActivePlan = (req, res, next) => {
  const user = req.user;
  
  // Verificar que el usuario tenga un plan
  if (!user.plan || user.plan === 'none') {
    return res.status(403).json({
      success: false,
      message: 'Necesitas suscribirte a un plan para acceder a esta funcionalidad'
    });
  }
  
  // Verificar que el plan esté activo
  if (user.planStatus !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'Tu suscripción ha expirado. Por favor renueva tu plan'
    });
  }
  
  // Verificar que el plan no haya expirado
  if (user.planEndDate && new Date() > new Date(user.planEndDate)) {
    return res.status(403).json({
      success: false,
      message: 'Tu plan ha expirado. Por favor renueva tu suscripción'
    });
  }
  
  next();
};

// Middleware para verificar feature específica
export const requireFeature = (featureName) => {
  return (req, res, next) => {
    const user = req.user;
    
    // Verificar plan activo primero
    if (!user.plan || user.plan === 'none' || user.planStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Necesitas un plan activo para acceder a esta funcionalidad'
      });
    }
    
    // Verificar si el plan del usuario tiene acceso a la feature
    const userPlanFeatures = planFeatures[user.plan];
    
    if (!userPlanFeatures || !userPlanFeatures[featureName]) {
      return res.status(403).json({
        success: false,
        message: `Esta funcionalidad requiere un plan superior. Actualiza tu plan para acceder.`,
        requiredPlans: getPlansWithFeature(featureName)
      });
    }
    
    next();
  };
};

// Helper: obtener qué planes tienen una feature específica
function getPlansWithFeature(featureName) {
  const plans = [];
  
  for (const [planName, features] of Object.entries(planFeatures)) {
    if (features[featureName] && planName !== 'none') {
      plans.push(planName);
    }
  }
  
  return plans;
}

// Middleware específicos por funcionalidad
export const requireLeadsExtraction = requireFeature('leadsExtraction');
export const requireEmailMarketing = requireFeature('emailMarketing');
export const requireInstagramSetter = requireFeature('instagramSetter');
export const requireAutoAgenda = requireFeature('autoAgenda');
