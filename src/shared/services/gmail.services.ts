import nodemailer from 'nodemailer';
import { logger } from '@/utils/logger';

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
};


export const sendEmailGmail = async ({ to, subject, htmlContent }: EmailOptions ): Promise<void> => {
    try {
        const info = await transporter.sendMail({
            from: `"JKE Soporte" <${process.env.BREVO_SENDER_EMAIL}>`,
            to,
            subject,
            html: htmlContent,
        });
        logger.info(`Email sent to ${to} with subject "${subject}" messageId: ${info.messageId}`);
    } catch (error) {
        logger.error('Error sending email:', error);
    }
}