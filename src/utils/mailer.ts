import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordChangeEmail = async (to: string): Promise<void> => {
  await transporter.sendMail({
    from: `"Soporte" <${process.env.ADMIN_EMAIL}>`,
    to,
    subject: 'Contraseña actualizada',
    html: `<p>Tu contraseña fue actualizada. Si no fuiste tú, contacta al soporte.</p>`,
  });
};

export const sendAccountLockedEmail = async (to: string, unlockTime: Date): Promise<void> => {
  await transporter.sendMail({
    from: `"Soporte" <${process.env.ADMIN_EMAIL}>`,
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
    from: `"Sistema de Seguridad" <${process.env.ADMIN_EMAIL}>`,
    to: process.env.ADMIN_EMAIL,
    subject: 'Usuario bloqueado por intentos fallidos',
    html: `
      <p>El usuario <strong>${userEmail}</strong> ha sido bloqueado por superar los intentos fallidos de inicio de sesión.</p>
      <p>La cuenta estará bloqueada hasta las <strong>${unlockTime.toLocaleTimeString()}</strong>.</p>
    `,
  });
};

export const sendResetEmail = async (to: string, token: string): Promise<void> => {
  await transporter.sendMail({
    from: `"Soporte" <${process.env.ADMIN_EMAIL}>`,
    to,
    subject: 'Restablecimiento de contraseña',
    html: `
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para restablecerla:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Restablecer contraseña</a>
      <p>Si no solicitaste este cambio, ignora este mensaje.</p>
    `,
  });
}

export const sendResetByAdminEmail = async (to: string, newPassword: string): Promise<void> => {
  await transporter.sendMail({
    from: `"Soporte" <${process.env.ADMIN_EMAIL}>`,
    to,
    subject: 'Nueva contraseña asignada por un administrador',
    html: `<p>Se te ha asignado una nueva contraseña: <strong>${newPassword}</strong></p><p>Por favor, cambia esta contraseña después de iniciar sesión.</p>`,
  });
};


// crear un validaciond de datos y correo electronico cuando envia un solicitud de registro firstName,lastName,businessName,email,phone , enviar un correo de confirmacion de registro
export const sendRegistrationEmail = async (to: string, firstName: string, lastName: string, token: string): Promise<void> => {
  await transporter.sendMail({
    from: `"Soporte" <${process.env.ADMIN_EMAIL}>`,
    to,
    subject: 'Confirmación de registro',
    html: `<p>Hola ${firstName} ${lastName},</p><p>Gracias por registrarte. Por favor, <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">Verificar correo electrónico</a> para completar el proceso de registro.</p>`,
  });
};




export const sendEmailVerification = async (to: string, token: string): Promise<void> => {
  await transporter.sendMail({
    from: `"Soporte" <${process.env.ADMIN_EMAIL}>`,
    to,
    subject: 'Verificación de correo electrónico',
    html: `
      <p>Por favor, verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
      <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">Verificar correo electrónico</a>
      <p>Si no solicitaste esta verificación, ignora este mensaje.</p>
    `,
  });
};

export const sendRequestVerificationEmail = async (to: string, requestCode: string): Promise<void> => {
  await transporter.sendMail({
    from: `"Soporte" <${process.env.ADMIN_EMAIL}>`,
    to,
    subject: 'Solicitud de registro ha sido verificada',
    html: `<p>Tu solicitud de registro ha sido verificado con el código: <strong>${requestCode}</strong>.</p><p>Nos pondremos en contacto contigo pronto.</p>`,
  });
}

