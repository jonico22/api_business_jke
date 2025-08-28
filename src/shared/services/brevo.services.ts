import brevo from "@getbrevo/brevo";
import { logger } from '@/utils/logger';

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY || ""
);

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
    } catch (error) {
        logger.error(`Error al enviar email a ${to}: ${error}`);
    }
 
}
