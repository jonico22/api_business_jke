import { sendEmail } from "@/shared/services/email.services";
import { EmailTemplateService } from "@/shared/services/emailTemplateService";

// Helper para obtener variables de entorno de forma segura
const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:3000';
const getAdminEmail = () => process.env.ADMIN_EMAIL || '';
const getFrontendAppUrl = () => process.env.FRONTEND_APP_URL || 'http://localhost:5173';

export const sendPasswordChangeEmail = async (to: string): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Contraseña actualizada',
    htmlContent: `<p>Tu contraseña fue actualizada. Si no fuiste tú, contacta al soporte.</p>`,
  });
};

export const sendAccountLockedEmail = async (to: string, unlockTime: Date): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Cuenta bloqueada por seguridad',
    htmlContent: `
      <p>Tu cuenta ha sido bloqueada temporalmente debido a múltiples intentos fallidos de inicio de sesión.</p>
      <p>Podrás volver a intentarlo después de las <strong>${unlockTime.toLocaleTimeString()}</strong>.</p>
      <p>Si no reconoces esta actividad, contacta al soporte inmediatamente.</p>
    `,
  });
};

export const notifyAdminOnUserLock = async (userEmail: string, unlockTime: Date): Promise<void> => {
  await sendEmail({
    to: getAdminEmail(),
    subject: 'Usuario bloqueado por intentos fallidos',
    htmlContent: `
      <p>El usuario <strong>${userEmail}</strong> ha sido bloqueado por superar los intentos fallidos de inicio de sesión.</p>
      <p>La cuenta estará bloqueada hasta las <strong>${unlockTime.toLocaleTimeString()}</strong>.</p>
    `,
  });
};

export const sendResetEmail = async (to: string, token: string): Promise<void> => {
  const html = await EmailTemplateService.getTemplate('reset-password', {
    reset_link: `${getFrontendAppUrl()}/auth/reset-password?token=${token}`
  });
  await sendEmail({
    to,
    subject: 'Restablecimiento de contraseña',
    htmlContent: html,
  });
}

export const sendResetByAdminEmail = async (to: string, newPassword: string): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Nueva contraseña asignada por un administrador',
    htmlContent: `<p>Se te ha asignado una nueva contraseña: <strong>${newPassword}</strong></p><p>Por favor, cambia esta contraseña después de iniciar sesión.</p>`,
  });
};

// crear un validaciond de datos y correo electronico cuando envia un solicitud de registro firstName,lastName,businessName,email,phone , enviar un correo de confirmacion de registro
export const sendRegistrationEmail = async (to: string, firstName: string, lastName: string, request: string): Promise<void> => {
  try {
    const html = await EmailTemplateService.getTemplate('register-verify', {
      first_name: firstName,
      last_name: lastName,
      verify_link: `${getFrontendUrl()}/verify-account?token=${request}`
    });

    await sendEmail({
      to,
      subject: 'Confirmación de registro',
      htmlContent: html,
    });
  } catch (error) {
    console.error('❌ Error en sendRegistrationEmail:', error);
    throw error; // Re-lanzamos para que el controlador sepa que falló
  }

};

export const sendEmailVerification = async (to: string, token: string): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Verificación de correo electrónico',
    htmlContent: `
      <p>Por favor, verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
      <a href="${getFrontendUrl()}/verify-email?token=${token}">Verificar correo electrónico</a>
      <p>Si no solicitaste esta verificación, ignora este mensaje.</p>
    `,
  });
};

// envia un correo electronico enviando los accesos de la cuenta como usuario y constraseña , adicional un mensaje de bienvenida
export const sendWelcomeEmail = async (to: string, firstName: string, lastName: string, username: string, password: string): Promise<void> => {

  try {
    const html = await EmailTemplateService.getTemplate('welcome', {
      first_name: firstName,
      last_name: lastName,
      username: username,
      password: password,
      login_url: `${getFrontendAppUrl()}`
    });
    await sendEmail({
      to,
      subject: 'Bienvenido a nuestra plataforma',
      htmlContent: html,
    });
  } catch (error) {
    console.error('❌ Error en sendWelcomeEmail:', error);
    throw error; // Re-lanzamos para que el controlador sepa que falló
  }

}

const formatter = new Intl.NumberFormat('es-PE', { // 'es-PE' para Perú, 'es-ES' para España, etc.
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
// crear un servicio de correo para enviar el pago de la suscripcion y ajuntar el recibo en formato pdf
export const sendSubscriptionPaymentEmail = async (to: string, amount: number, currency: string, receiptUrl: string): Promise<void> => {

  try {
    const formattedAmount = formatter.format(amount);

    const html = await EmailTemplateService.getTemplate('subscription-receipt', {
      amount: formattedAmount,
      currency: currency,
      receipt_url: receiptUrl,
      date: new Date().toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    });

    await sendEmail({
      to,
      subject: 'Pago de suscripción recibido',
      htmlContent: html,
    });
  } catch (error) {
    console.error('❌ Error en sendSubscriptionPaymentEmail:', error);
    throw error; // Re-lanzamos para que el controlador sepa que falló
  }

}

export const sendSubscriptionRenewalReminder = async (to: string, daysLeft: number, endDate: Date): Promise<void> => {
  try {
    const formattedDate = endDate.toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const htmlContent = `
      <h2>¡Atención! Tu suscripción expira pronto</h2>
      <p>Hola,</p>
      <p>Te escribimos para recordarte que tu suscripción finalizará en <strong>${daysLeft} días</strong> (el ${formattedDate}).</p>
      <p>Para evitar interrupciones en el servicio, por favor realiza el pago de tu plan (Mediante Transferencia Bancaria) entrando a tu panel de facturación.</p>
      <br/>
      <a href="${getFrontendAppUrl()}/settings/billing" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Notificar Pago</a>
    `;

    await sendEmail({
      to,
      subject: `Tu suscripción expira en ${daysLeft} días`,
      htmlContent,
    });
  } catch (error) {
    console.error('❌ Error enviando recordatorio de suscripción:', error);
  }
};

export const sendSubscriptionExpired = async (to: string): Promise<void> => {
  try {
    const htmlContent = `
      <h2>Tu suscripción ha expirado - Período de Gracia</h2>
      <p>Hola,</p>
      <p>Queremos informarte que la fecha límite de tu suscripción ha expirado. Al no contar con un sistema de cobro automático, no hemos registrado ningún pago reciente.</p>
      <p>Para apoyarte, te hemos otorgado un <strong>Periodo de Gracia de 7 días</strong> para que puedas realizar tu transferencia y no perder el acceso a la plataforma.</p>
      <br/>
      <a href="${getFrontendAppUrl()}/settings/billing" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Ver detalles de transferencia</a>
    `;

    await sendEmail({
      to,
      subject: 'Tu suscripción ha expirado (7 días de gracia)',
      htmlContent,
    });
  } catch (error) {
    console.error('❌ Error enviando correo de expiración:', error);
  }
};

export const sendSubscriptionCancelledFinal = async (to: string): Promise<void> => {
  try {
    const htmlContent = `
      <h2>Tu suscripción ha sido cancelada definitivamente</h2>
      <p>Hola,</p>
      <p>Te informamos que tu periodo de gracia de 7 días ha concluido sin registrar un pago, por lo que tu suscripción ha sido cancelada permanentemente.</p>
      <p>Para volver a utilizar nuestro servicio, deberás adquirir un nuevo plan desde tu panel de facturación.</p>
      <br/>
      <a href="${getFrontendAppUrl()}/settings/billing" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Ver Planes</a>
    `;

    await sendEmail({
      to,
      subject: 'Cancelación definitiva de Suscripción',
      htmlContent,
    });
  } catch (error) {
    console.error('❌ Error enviando correo de cancelación final:', error);
  }
};
