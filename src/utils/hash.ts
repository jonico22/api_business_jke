import crypto from 'crypto';
import argon2 from 'argon2';
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateToken =  () => {
  return crypto.randomUUID();
}   

export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password);
}

export const generateRandomPassword = () => {
  // generar contraseña aleatoria de 8 caracteres
  let password = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 8; i++) {
    password += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return password;
  //return crypto.randomBytes(6).toString('base64'); // genera una cadena segura
};