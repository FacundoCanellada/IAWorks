import { validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { sendEmail } from '../utils/sendEmail.js';

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, email, password } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      role: 'user'
    });

    // Generar token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        token
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada. Contacte al administrador'
      });
    }

    // Generar token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        planStartDate: user.planStartDate,
        planEndDate: user.planEndDate,
        smtpConfigured: user.smtpConfig?.configured || false,
        instagramConfigured: user.instagramConfig?.configured || false,
        token
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        planStartDate: user.planStartDate,
        planEndDate: user.planEndDate,
        smtpConfigured: user.smtpConfig?.configured || false,
        instagramConfigured: user.instagramConfig?.configured || false,
        leadsCount: user.leads?.length || 0,
        appointmentsCount: user.appointments?.length || 0,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message
    });
  }
};

// @desc    Actualizar perfil
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está en uso'
        });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
};

// @desc    Actualizar contraseña
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Verificar contraseña actual
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar contraseña',
      error: error.message
    });
  }
};

// @desc    Recuperar contraseña
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No existe usuario con ese email'
      });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutos

    await user.save({ validateBeforeSave: false });

    // URL de recuperación
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
      <h1>Recuperación de Contraseña</h1>
      <p>Has solicitado restablecer tu contraseña.</p>
      <p>Por favor, haz clic en el siguiente enlace para crear una nueva contraseña:</p>
      <a href="${resetUrl}" target="_blank">Restablecer Contraseña</a>
      <p>Este enlace expirará en 10 minutos.</p>
      <p>Si no solicitaste este cambio, ignora este mensaje.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Recuperación de Contraseña - IAWorks',
        html: message
      });

      res.json({
        success: true,
        message: 'Email de recuperación enviado'
      });
    } catch (error) {
      console.error(error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Error al enviar email de recuperación'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error en recuperación de contraseña',
      error: error.message
    });
  }
};

// @desc    Resetear contraseña
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Establecer nueva contraseña
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al restablecer contraseña',
      error: error.message
    });
  }
};

// @desc    Actualizar configuración SMTP
// @route   PUT /api/auth/smtp
// @access  Private
export const updateSMTP = async (req, res) => {
  try {
    const { host, port, user, pass } = req.body;

    const userDoc = await User.findById(req.user._id);

    userDoc.smtpConfig = {
      host,
      port,
      user,
      pass,
      configured: true
    };

    await userDoc.save();

    res.json({
      success: true,
      message: 'Configuración SMTP actualizada exitosamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar configuración SMTP',
      error: error.message
    });
  }
};

// @desc    Actualizar configuración Instagram
// @route   PUT /api/auth/instagram
// @access  Private
export const updateInstagram = async (req, res) => {
  try {
    const { username, accessToken, businessAccountId } = req.body;

    const user = await User.findById(req.user._id);

    user.instagramConfig = {
      username,
      accessToken,
      businessAccountId,
      configured: true
    };

    await user.save();

    res.json({
      success: true,
      message: 'Configuración de Instagram actualizada exitosamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar configuración de Instagram',
      error: error.message
    });
  }
};

// @desc    Verificar si existe admin
// @route   GET /api/auth/admin/exists
// @access  Public
export const checkAdminExists = async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });

    res.json({
      success: true,
      adminExists: !!adminExists
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar administrador',
      error: error.message
    });
  }
};

// @desc    Crear primer administrador
// @route   POST /api/auth/admin/create-first
// @access  Public (pero solo funciona si no hay admin)
export const createFirstAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { name, email, password, adminKey } = req.body;

    // Verificar que no exista ya un admin
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un administrador en el sistema'
      });
    }

    // Verificar clave de admin (puedes cambiar esto por una clave más segura)
    if (adminKey !== 'IAWORKS_ADMIN_2024') {
      return res.status(401).json({
        success: false,
        message: 'Clave de administrador incorrecta'
      });
    }

    // Crear primer admin
    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      message: 'Administrador creado exitosamente',
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear administrador',
      error: error.message
    });
  }
};
