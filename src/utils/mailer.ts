import { sendEmail } from "@/shared/services/email.services";
import { EmailTemplateService } from "@/shared/services/emailTemplateService";

// Helper para obtener variables de entorno de forma segura
const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:3000';
const getAdminEmail = () => process.env.ADMIN_EMAIL || '';
const getFrontendAppUrl = () => process.env.FRONTEND_APP_URL || 'http://localhost:5173';

// ─── Layout base reutilizable ───────────────────────────────────────────────
const wrapInLayout = (content: string) => `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0ea5e9,#2563eb);padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">JKE Solutions</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 36px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px 28px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
              Este es un correo automático, por favor no respondas a este mensaje.<br/>
              © ${new Date().getFullYear()} JKE Solutions. Todos los derechos reservados.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

const primaryButton = (text: string, href: string) => `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
  <tr><td align="center">
    <a href="${href}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.3px;">
      ${text}
    </a>
  </td></tr>
</table>
`;

// ─── Correos ─────────────────────────────────────────────────────────────────

export const sendPasswordChangeEmail = async (to: string): Promise<void> => {
  const html = wrapInLayout(`
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:600;">Tu contraseña ha sido actualizada</h2>
    <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
      Te confirmamos que la contraseña de tu cuenta fue cambiada exitosamente.
    </p>
    <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
      Si tú realizaste este cambio, no necesitas hacer nada más.
    </p>
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:6px;margin:20px 0;">
      <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
        <strong>⚠️ ¿No reconoces esta acción?</strong><br/>
        Si no fuiste tú quien cambió la contraseña, contacta con nuestro equipo de soporte de inmediato para proteger tu cuenta.
      </p>
    </div>
  `);

  await sendEmail({
    to,
    subject: '🔐 Tu contraseña ha sido actualizada',
    htmlContent: html,
  });
};

export const sendAccountLockedEmail = async (to: string, unlockTime: Date): Promise<void> => {
  const formattedTime = unlockTime.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  const html = wrapInLayout(`
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:600;">Cuenta bloqueada temporalmente</h2>
    <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
      Tu cuenta ha sido bloqueada de forma preventiva debido a múltiples intentos fallidos de inicio de sesión.
    </p>
    <div style="background:#fee2e2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:6px;margin:20px 0;">
      <p style="margin:0;color:#991b1b;font-size:13px;line-height:1.5;">
        <strong>🔒 Cuenta bloqueada</strong><br/>
        Podrás volver a intentar iniciar sesión después de las <strong>${formattedTime}</strong>.
      </p>
    </div>
    <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">
      Si no reconoces esta actividad, te recomendamos cambiar tu contraseña inmediatamente después de que tu cuenta sea desbloqueada.
    </p>
  `);

  await sendEmail({
    to,
    subject: '🔒 Tu cuenta ha sido bloqueada temporalmente',
    htmlContent: html,
  });
};

export const notifyAdminOnUserLock = async (userEmail: string, unlockTime: Date): Promise<void> => {
  const formattedTime = unlockTime.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = unlockTime.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });

  const html = wrapInLayout(`
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:600;">Alerta: Usuario bloqueado por intentos fallidos</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">
      Se ha detectado actividad sospechosa en la siguiente cuenta:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;margin:16px 0;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px;color:#64748b;font-size:12px;text-transform:uppercase;font-weight:600;">Usuario afectado</p>
          <p style="margin:0;color:#1e293b;font-size:15px;font-weight:600;">${userEmail}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 20px 16px;">
          <p style="margin:0 0 8px;color:#64748b;font-size:12px;text-transform:uppercase;font-weight:600;">Bloqueado hasta</p>
          <p style="margin:0;color:#1e293b;font-size:15px;font-weight:600;">${formattedDate} a las ${formattedTime}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">
      El bloqueo se activó automáticamente tras superar el límite de intentos de inicio de sesión permitidos.
    </p>
  `);

  await sendEmail({
    to: getAdminEmail(),
    subject: `⚠️ Usuario bloqueado: ${userEmail}`,
    htmlContent: html,
  });
};

export const sendResetEmail = async (to: string, token: string): Promise<void> => {
  const html = await EmailTemplateService.getTemplate('reset-password', {
    reset_link: `${getFrontendAppUrl()}/auth/reset-password?token=${token}`
  });
  await sendEmail({
    to,
    subject: '🔑 Restablece tu contraseña',
    htmlContent: html,
  });
}

export const sendResetByAdminEmail = async (to: string, newPassword: string): Promise<void> => {
  const html = wrapInLayout(`
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:600;">Tu contraseña ha sido restablecida</h2>
    <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
      Un administrador ha restablecido la contraseña de tu cuenta. A continuación encontrarás tus nuevas credenciales de acceso:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;margin:20px 0;">
      <tr>
        <td style="padding:16px 20px;text-align:center;">
          <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;font-weight:600;">Nueva contraseña temporal</p>
          <p style="margin:0;color:#0369a1;font-size:20px;font-weight:700;font-family:monospace;letter-spacing:2px;">${newPassword}</p>
        </td>
      </tr>
    </table>
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:6px;margin:20px 0;">
      <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
        <strong>Importante:</strong> Por seguridad, deberás cambiar esta contraseña la próxima vez que inicies sesión.
      </p>
    </div>
    ${primaryButton('Iniciar Sesión', getFrontendAppUrl())}
  `);

  await sendEmail({
    to,
    subject: '🔑 Tu contraseña ha sido restablecida por un administrador',
    htmlContent: html,
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
      subject: '✅ Confirma tu registro en JKE Solutions',
      htmlContent: html,
    });
  } catch (error) {
    console.error('❌ Error en sendRegistrationEmail:', error);
    throw error; // Re-lanzamos para que el controlador sepa que falló
  }

};

export const sendEmailVerification = async (to: string, token: string): Promise<void> => {
  const html = wrapInLayout(`
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:600;">Verifica tu correo electrónico</h2>
    <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
      Hemos recibido una solicitud para verificar este correo electrónico. Por favor, haz clic en el botón de abajo para completar el proceso.
    </p>
    ${primaryButton('Verificar mi correo', `${getFrontendUrl()}/verify-email?token=${token}`)}
    <p style="margin:20px 0 0;color:#94a3b8;font-size:12px;line-height:1.5;text-align:center;">
      Si no solicitaste esta verificación, puedes ignorar este mensaje de forma segura.
    </p>
  `);

  await sendEmail({
    to,
    subject: '📧 Verifica tu correo electrónico',
    htmlContent: html,
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
      subject: '🎉 Bienvenido a JKE Solutions',
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
      subject: '💳 Pago de suscripción recibido',
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

    const html = wrapInLayout(`
      <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:600;">Tu suscripción está por vencer</h2>
      <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
        Hola, te escribimos para recordarte que tu suscripción finalizará pronto.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;margin:20px 0;">
        <tr>
          <td style="padding:16px 20px;text-align:center;">
            <p style="margin:0 0 4px;color:#92400e;font-size:28px;font-weight:700;">${daysLeft} días</p>
            <p style="margin:0;color:#92400e;font-size:13px;">restantes — vence el <strong>${formattedDate}</strong></p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
        Para evitar interrupciones en el servicio, te recomendamos realizar el pago de tu plan desde tu panel de facturación.
      </p>
      ${primaryButton('Ir a Facturación', `${getFrontendAppUrl()}/settings/billing`)}
    `);

    await sendEmail({
      to,
      subject: `⏰ Tu suscripción vence en ${daysLeft} días`,
      htmlContent: html,
    });
  } catch (error) {
    console.error('❌ Error enviando recordatorio de suscripción:', error);
  }
};

export const sendSubscriptionExpired = async (to: string): Promise<void> => {
  try {
    const html = wrapInLayout(`
      <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:600;">Tu suscripción ha expirado</h2>
      <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
        Hola, te informamos que la fecha límite de tu suscripción ha expirado y no hemos registrado un pago reciente.
      </p>
      <div style="background:#dbeafe;border-left:4px solid #3b82f6;padding:12px 16px;border-radius:6px;margin:20px 0;">
        <p style="margin:0;color:#1e40af;font-size:13px;line-height:1.5;">
          <strong>📌 Período de Gracia</strong><br/>
          Para apoyarte, te hemos otorgado un período de gracia de <strong>7 días</strong> para que puedas realizar tu transferencia y no perder el acceso a la plataforma.
        </p>
      </div>
      <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
        Realiza el pago lo antes posible para continuar disfrutando de todos los beneficios de tu plan.
      </p>
      ${primaryButton('Ver detalles de pago', `${getFrontendAppUrl()}/settings/billing`)}
    `);

    await sendEmail({
      to,
      subject: '⚠️ Tu suscripción ha expirado — Período de gracia activo',
      htmlContent: html,
    });
  } catch (error) {
    console.error('❌ Error enviando correo de expiración:', error);
  }
};

export const sendSubscriptionCancelledFinal = async (to: string): Promise<void> => {
  try {
    const html = wrapInLayout(`
      <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;font-weight:600;">Suscripción cancelada definitivamente</h2>
      <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
        Hola, lamentamos informarte que tu período de gracia de 7 días ha concluido sin registrar un pago, por lo que tu suscripción ha sido cancelada.
      </p>
      <div style="background:#fee2e2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:6px;margin:20px 0;">
        <p style="margin:0;color:#991b1b;font-size:13px;line-height:1.5;">
          <strong>Acceso suspendido</strong><br/>
          Tu acceso a las funcionalidades del plan ha sido desactivado. Los datos de tu negocio se mantienen almacenados de forma segura.
        </p>
      </div>
      <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
        Para reactivar tu servicio, adquiere un nuevo plan desde tu panel de facturación.
      </p>
      ${primaryButton('Ver Planes Disponibles', `${getFrontendAppUrl()}/settings/billing`)}
    `);

    await sendEmail({
      to,
      subject: '❌ Tu suscripción ha sido cancelada',
      htmlContent: html,
    });
  } catch (error) {
    console.error('❌ Error enviando correo de cancelación final:', error);
  }
};
