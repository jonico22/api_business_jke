import { sendEmailGmail } from "./gmail.services";
import { sendEmailBrevo } from "./brevo.services";

interface EmailOptions {
    to: string;
    subject: string;
    htmlContent: string;
}

export const sendEmail = async (options: EmailOptions) => {
  const emailService = process.env.NODE_ENV === 'production' ? 'brevo' : 'gmail';

  if (emailService === 'brevo') {
    await sendEmailBrevo(options);
  } else {
    await sendEmailGmail(options);
  }
}