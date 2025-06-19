import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordChangeEmail = async (to: string): Promise<void> => {
  await transporter.sendMail({
    from: `"Soporte" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Contraseña actualizada',
    html: `<p>Tu contraseña fue actualizada. Si no fuiste tú, contacta al soporte.</p>`,
  });
};

export const sendAccountLockedEmail = async (to: string, unlockTime: Date): Promise<void> => {
  await transporter.sendMail({
    from: `"Soporte" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Cuenta bloqueada por seguridad',
    html: `
      <p>Tu cuenta ha sido bloqueada temporalmente debido a múltiples intentos fallidos de inicio de sesión.</p>
      <p>Podrás volver a intentarlo después de las <strong>${unlockTime.toLocaleTimeString()}</strong>.</p>
      <p>Si no reconoces esta actividad, contacta al soporte inmediatamente.</p>
    `,
  });
};

export const notifyAdminOnUserLock = async (userEmail: string, unlockTime: Date): Promise<void> => {
  await transporter.sendMail({
    from: `"Sistema de Seguridad" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: 'Usuario bloqueado por intentos fallidos',
    html: `
      <p>El usuario <strong>${userEmail}</strong> ha sido bloqueado por superar los intentos fallidos de inicio de sesión.</p>
      <p>La cuenta estará bloqueada hasta las <strong>${unlockTime.toLocaleTimeString()}</strong>.</p>
    `,
  });
};