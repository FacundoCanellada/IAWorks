import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Coupon from '../models/Coupon.js';
import Log from '../models/Log.js';
import bcrypt from 'bcryptjs';

// ===== GESTIÓN DE USUARIOS =====

// Obtener todos los usuarios
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

// Suspender/Activar usuario
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'No puedes suspender a un administrador'
      });
    }
    
    user.planStatus = user.planStatus === 'active' ? 'suspended' : 'active';
    await user.save();
    
    res.json({
      success: true,
      message: `Usuario ${user.planStatus === 'active' ? 'activado' : 'suspendido'} exitosamente`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del usuario',
      error: error.message
    });
  }
};

// Cambiar plan de usuario
export const changeUserPlan = async (req, res) => {
  try {
    const { userId, newPlan } = req.body;
    
    const validPlans = ['casual', 'premium', 'golden', 'none'];
    if (!validPlans.includes(newPlan)) {
      return res.status(400).json({
        success: false,
        message: 'Plan inválido'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    user.plan = newPlan;
    
    if (newPlan !== 'none') {
      // Si se asigna un plan, activarlo
      user.planStatus = 'active';
      if (!user.planStartDate) {
        user.planStartDate = new Date();
      }
      // Extender 30 días
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      user.planEndDate = endDate;
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: `Plan cambiado a ${newPlan} exitosamente`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar plan',
      error: error.message
    });
  }
};

// Resetear contraseña de usuario
export const resetUserPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al restablecer contraseña',
      error: error.message
    });
  }
};

// ===== GESTIÓN DE CUPONES =====

// Obtener todos los cupones
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: coupons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener cupones',
      error: error.message
    });
  }
};

// Crear cupón
export const createCoupon = async (req, res) => {
  try {
    const { code, discountPercentage, expiryDate, maxUses, applicablePlans, affiliate } = req.body;
    
    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountPercentage,
      expiryDate,
      maxUses,
      applicablePlans: applicablePlans || ['casual', 'premium', 'golden'],
      affiliate,
      createdBy: req.user.id
    });
    
    await coupon.save();
    
    res.json({
      success: true,
      message: 'Cupón creado exitosamente',
      data: coupon
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un cupón con ese código'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al crear cupón',
      error: error.message
    });
  }
};

// Editar cupón
export const updateCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const updates = req.body;
    
    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Cupón actualizado exitosamente',
      data: coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cupón',
      error: error.message
    });
  }
};

// Eliminar cupón
export const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    
    const coupon = await Coupon.findByIdAndDelete(couponId);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Cupón eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cupón',
      error: error.message
    });
  }
};

// ===== LOGS DEL SISTEMA =====

// Obtener logs
export const getLogs = async (req, res) => {
  try {
    const { type, level, limit = 100 } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (level) query.level = level;
    
    const logs = await Log.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener logs',
      error: error.message
    });
  }
};

// Crear log (helper function)
export const createLog = async (type, level, message, details, userId = null, req = null) => {
  try {
    const log = new Log({
      type,
      level,
      message,
      details,
      user: userId,
      ipAddress: req?.ip,
      userAgent: req?.get('user-agent')
    });
    
    await log.save();
    return log;
  } catch (error) {
    console.error('Error al crear log:', error);
  }
};

// ===== ESTADÍSTICAS =====

// Obtener estadísticas del dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeSubscriptions = await User.countDocuments({ planStatus: 'active' });
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    
    // Usuarios por plan
    const usersByPlan = await User.aggregate([
      { $match: { role: 'user' } },
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);
    
    // Pagos recientes
    const recentPayments = await Payment.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: {
        totalUsers,
        activeSubscriptions,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingPayments,
        usersByPlan,
        recentPayments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};
