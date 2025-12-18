import Payment from '../models/Payment.js';
import User from '../models/User.js';

// Precios de los planes
const PLAN_PRICES = {
  casual: 20,
  premium: 40,
  golden: 60
};

// Crear intención de pago
export const createPaymentIntent = async (req, res) => {
  try {
    const { plan, paymentMethod } = req.body;
    
    if (!PLAN_PRICES[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Plan inválido'
      });
    }
    
    const validMethods = ['paypal', 'usdc', 'bank_transfer'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Método de pago inválido'
      });
    }
    
    // Crear registro de pago
    const payment = new Payment({
      user: req.user.id,
      plan,
      amount: PLAN_PRICES[plan],
      paymentMethod,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    // Si es transferencia bancaria, generar referencia
    if (paymentMethod === 'bank_transfer') {
      payment.generateBankReference();
    }
    
    await payment.save();
    
    // Obtener configuración de pagos del admin
    const admin = await User.findOne({ role: 'admin' });
    
    let paymentData = {
      paymentId: payment._id,
      plan,
      amount: PLAN_PRICES[plan],
      paymentMethod
    };
    
    // Agregar datos específicos según método
    if (paymentMethod === 'paypal' && admin?.paymentConfig?.paypal?.configured) {
      paymentData.paypalEmail = admin.paymentConfig.paypal.businessEmail;
    } else if (paymentMethod === 'usdc' && admin?.paymentConfig?.crypto?.configured) {
      paymentData.usdcWallet = admin.paymentConfig.crypto.usdcWallet;
    } else if (paymentMethod === 'bank_transfer' && admin?.paymentConfig?.bankTransfer?.configured) {
      paymentData.bankInfo = {
        bankName: admin.paymentConfig.bankTransfer.bankName,
        iban: admin.paymentConfig.bankTransfer.iban,
        accountHolder: admin.paymentConfig.bankTransfer.accountHolder,
        reference: payment.bankReference
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Método de pago no configurado por el administrador'
      });
    }
    
    res.json({
      success: true,
      data: paymentData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear intención de pago',
      error: error.message
    });
  }
};

// Confirmar pago de PayPal
export const confirmPayPalPayment = async (req, res) => {
  try {
    const { paymentId, orderId, payerId } = req.body;
    
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }
    
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }
    
    // TODO: Verificar con API de PayPal que el pago se completó
    // Por ahora, marcar como pendiente para que el admin lo apruebe manualmente
    
    payment.status = 'pending';
    payment.paypalOrderId = orderId;
    payment.paypalPayerId = payerId;
    
    await payment.save();
    
    res.json({
      success: true,
      message: 'Pago registrado. El administrador verificará tu pago.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al confirmar pago',
      error: error.message
    });
  }
};

// Confirmar pago de USDC
export const confirmCryptoPayment = async (req, res) => {
  try {
    const { paymentId, txHash, fromAddress } = req.body;
    
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }
    
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }
    
    // TODO: Verificar transacción en blockchain usando Etherscan/Alchemy API
    // Por ahora, guardar hash y marcar como pendiente de verificación
    
    payment.cryptoTxHash = txHash;
    payment.cryptoFromAddress = fromAddress;
    payment.status = 'pending'; // Admin debe verificar manualmente
    
    await payment.save();
    
    res.json({
      success: true,
      message: 'Transacción registrada. Verificación en proceso.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al confirmar pago cripto',
      error: error.message
    });
  }
};

// Confirmar pago por transferencia bancaria
export const confirmBankTransfer = async (req, res) => {
  try {
    const { paymentId, proofUrl } = req.body;
    
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }
    
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }
    
    payment.bankProof = proofUrl;
    payment.status = 'pending'; // Espera verificación del admin
    
    await payment.save();
    
    res.json({
      success: true,
      message: 'Comprobante enviado. El administrador verificará tu pago.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al confirmar transferencia',
      error: error.message
    });
  }
};

// [ADMIN] Obtener pagos pendientes
export const getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'pending' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener pagos pendientes',
      error: error.message
    });
  }
};

// [ADMIN] Aprobar pago manualmente
export const approvePayment = async (req, res) => {
  try {
    const { paymentId } = req.body;
    
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }
    
    payment.status = 'completed';
    payment.completedAt = new Date();
    
    await payment.save();
    
    // Activar suscripción del usuario
    await activateUserSubscription(
      payment.user,
      payment.plan,
      payment.paymentMethod,
      payment._id.toString()
    );
    
    res.json({
      success: true,
      message: 'Pago aprobado y suscripción activada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al aprobar pago',
      error: error.message
    });
  }
};

// [ADMIN] Rechazar pago
export const rejectPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;
    
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }
    
    payment.status = 'failed';
    
    await payment.save();
    
    res.json({
      success: true,
      message: 'Pago rechazado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al rechazar pago',
      error: error.message
    });
  }
};

// [ADMIN] Configurar métodos de pago
export const updatePaymentConfig = async (req, res) => {
  try {
    const { paymentMethod, config } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (paymentMethod === 'paypal') {
      user.paymentConfig.paypal = {
        businessEmail: config.businessEmail,
        configured: true
      };
    } else if (paymentMethod === 'crypto') {
      user.paymentConfig.crypto = {
        usdcWallet: config.usdcWallet,
        configured: true
      };
    } else if (paymentMethod === 'bank_transfer') {
      user.paymentConfig.bankTransfer = {
        bankName: config.bankName,
        iban: config.iban,
        accountHolder: config.accountHolder,
        configured: true
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Método de pago inválido'
      });
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Configuración de pago actualizada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar configuración',
      error: error.message
    });
  }
};

// Helper: Activar suscripción de usuario
async function activateUserSubscription(userId, plan, paymentMethod, subscriptionId) {
  const user = await User.findById(userId);
  
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);
  
  user.plan = plan;
  user.planStatus = 'active';
  user.planStartDate = startDate;
  user.planEndDate = endDate;
  user.paymentMethod = paymentMethod;
  
  if (paymentMethod === 'paypal') {
    user.paypalSubscriptionId = subscriptionId;
  }
  
  await user.save();
  
  return user;
}
