import * as brevo from "@getbrevo/brevo";
import { logger } from '@/utils/logger';

const apiInstance = new brevo.TransactionalEmailsApi();

// Eliminamos la asignación estática aquí arriba.
interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
};

export const sendEmailBrevo = async ({
  to,
  subject,
  htmlContent,
}: EmailOptions
) => {
  try {
    let apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      throw new Error("BREVO_API_KEY no está definida en las variables de entorno");
    }

    // Limpiamos posibles espacios o comillas accidentales
    apiKey = apiKey.replace(/['"]/g, '').trim();

    // LOG DE DEPURACIÓN (solo muestra los primeros y últimos 4 caracteres, no expone la llave entera)
    const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
    logger.info(`[Brevo] Intentando autenticar con API KEY: ${maskedKey}`);

    // Asignamos la llave dinámicamente justo antes de llamar
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      apiKey
    );

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = {
      name: "JKE soporte",
      email: process.env.BREVO_SENDER_EMAIL || "Jkesolutionsdev@gmail.com"
    };
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    logger.info(`Email enviado a ${to} con asunto "${subject}" result: ${JSON.stringify(result)}`);
  } catch (error: any) {
    const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    logger.error(`Error al enviar email a ${to}: ${error.name} - ${errorDetails}`);
  }

}
