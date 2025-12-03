import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  // Crear transportador
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Opciones del mensaje
  const message = {
    from: `${process.env.FROM_NAME || 'IAWorks'} <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html
  };

  // Enviar email
  const info = await transporter.sendMail(message);

  console.log('Email enviado: %s', info.messageId);
};
