// src/shared/utils/token-email.ts
import jwt from 'jsonwebtoken';

const EMAIL_SECRET = process.env.EMAIL_SECRET || 'secret'; // añadir a tu .env

export const generateEmailToken = (email: string) => {
  return jwt.sign({ email }, EMAIL_SECRET, { expiresIn: '15m' });
};

export const verifyEmailToken = (token: string): { email: string } => {
  return jwt.verify(token, EMAIL_SECRET) as { email: string };
};
