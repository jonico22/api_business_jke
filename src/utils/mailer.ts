import { sendEmail } from "@/shared/services/email.services";

export const sendPasswordChangeEmail = async (to: string): Promise<void> => {
  sendEmail({
    to,
    subject: 'Contraseña actualizada',
    htmlContent: `<p>Tu contraseña fue actualizada. Si no fuiste tú, contacta al soporte.</p>`,
  });
};

export const sendAccountLockedEmail = async (to: string, unlockTime: Date): Promise<void> => {
  sendEmail({
    to,
    subject: 'Cuenta bloqueada por seguridad',
    htmlContent:  `
      <p>Tu cuenta ha sido bloqueada temporalmente debido a múltiples intentos fallidos de inicio de sesión.</p>
      <p>Podrás volver a intentarlo después de las <strong>${unlockTime.toLocaleTimeString()}</strong>.</p>
      <p>Si no reconoces esta actividad, contacta al soporte inmediatamente.</p>
    `,
  });
};

export const notifyAdminOnUserLock = async (userEmail: string, unlockTime: Date): Promise<void> => {
  
  sendEmail({
    to: process.env.ADMIN_EMAIL || '',
    subject: 'Usuario bloqueado por intentos fallidos',
    htmlContent: `
      <p>El usuario <strong>${userEmail}</strong> ha sido bloqueado por superar los intentos fallidos de inicio de sesión.</p>
      <p>La cuenta estará bloqueada hasta las <strong>${unlockTime.toLocaleTimeString()}</strong>.</p>
    `,
  });
};

export const sendResetEmail = async (to: string, token: string): Promise<void> => {
  
  sendEmail({
    to,
    subject: 'Restablecimiento de contraseña',
    htmlContent: `
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para restablecerla:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Restablecer contraseña</a>
      <p>Si no solicitaste este cambio, ignora este mensaje.</p>
    `,
  });

}

export const sendResetByAdminEmail = async (to: string, newPassword: string): Promise<void> => {
  sendEmail({
    to,
    subject: 'Nueva contraseña asignada por un administrador',
    htmlContent: `<p>Se te ha asignado una nueva contraseña: <strong>${newPassword}</strong></p><p>Por favor, cambia esta contraseña después de iniciar sesión.</p>`,
  });
};

// crear un validaciond de datos y correo electronico cuando envia un solicitud de registro firstName,lastName,businessName,email,phone , enviar un correo de confirmacion de registro
export const sendRegistrationEmail = async (to: string, firstName: string, lastName: string, request: string): Promise<void> => {
  sendEmail({
    to,
    subject: 'Confirmación de registro',
    htmlContent: `<p>Hola ${firstName} ${lastName},</p><p>Gracias por registrarte. Por favor, <a href="${process.env.FRONTEND_URL}/verify-account?token=${request}">Verificar correo electrónico</a> para completar el proceso de registro.</p>`,
  });
};


export const sendEmailVerification = async (to: string, token: string): Promise<void> => { 
  sendEmail({
    to,
    subject: 'Verificación de correo electrónico',
    htmlContent: `
      <p>Por favor, verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
      <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">Verificar correo electrónico</a>
      <p>Si no solicitaste esta verificación, ignora este mensaje.</p>
    `,
  });
};

// envia un correo electronico enviando los accesos de la cuenta como usuario y constraseña , adicional un mensaje de bienvenida
export const sendWelcomeEmail = async (to: string, firstName: string, lastName: string, username: string, password: string): Promise<void> => {
  sendEmail({
    to,
    subject: 'Bienvenido a nuestra plataforma',
    htmlContent: `
      <p>Hola ${firstName} ${lastName},</p>
      <p>Tu cuenta ha sido creada exitosamente. Aquí están tus credenciales de acceso:</p>
      <ul>
        <li>Usuario: <strong>${username}</strong></li>
        <li>Contraseña: <strong>${password}</strong></li>
      </ul>
      <p>Por favor, cambia tu contraseña después de iniciar sesión por primera vez.</p>
      <p>¡Bienvenido a bordo!</p>
    `,
  });
}

// crear un servicio de correo para enviar el pago de la suscripcion y ajuntar el recibo en formato pdf
export const sendSubscriptionPaymentEmail = async (to: string, amount: number, currency: string, receiptUrl: string): Promise<void> => {
  sendEmail({
    to,
    subject: 'Pago de suscripción recibido',
    htmlContent: `<p>Hemos recibido tu pago de suscripción por un monto de <strong>${amount} ${currency}</strong>.</p><p>Adjuntamos el recibo de tu pago para tus registros.</p><p><a href="${receiptUrl}">Ver recibo</a></p>`,
  });
}
