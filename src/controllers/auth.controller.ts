import { Request, Response } from 'express';
import prisma from '../config/database';
import { hashToken } from '../utils/hash';
import argon2 from 'argon2';
import { transporter } from '../utils/mailer';
import { loginSchema } from '../validations/user.validation';
import { sendAccountLockedEmail,notifyAdminOnUserLock } from '../utils/mailer';

const MAX_LOGIN_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS || 5);
const LOGIN_BLOCK_TIME = Number(process.env.LOGIN_BLOCK_TIME || 15); // minutos

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

  const token = crypto.randomUUID();
  const hashedToken = hashToken(token);
  const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos

  await prisma.passwordResetToken.create({
    data: {
      token: hashedToken,
      userId: user.id,
      expiresAt: expires,
    },
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    to: user.email,
    subject: 'Restablecer contraseña',
    html: `<p>Haz clic <a href="${resetUrl}">aquí</a> para restablecer tu contraseña.</p>`,
  });

  return res.json({ message: 'Correo enviado si el usuario existe' });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const hashed = hashToken(token);

  const record = await prisma.passwordResetToken.findUnique({ where: { token: hashed } });
  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Token inválido o expirado' });
  }

  const hash = await argon2.hash(password);
  await prisma.account.updateMany({
    where: { userId: record.userId },
    data: { password: hash },
  });

  await prisma.passwordResetToken.delete({ where: { token: hashed } });

  return res.json({ message: 'Contraseña actualizada correctamente' });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const account = await prisma.account.findFirst({
    where: {
      accountId: email,
      providerId: 'credentials',
    },
    include: {
      user: true,
    },
  });

  if (!account || !account.password) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  const user = account.user;

  if (!user.isActive) {
    return res.status(403).json({ message: 'Tu cuenta no está habilitada' });
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return res.status(403).json({
      message: `Cuenta bloqueada hasta ${user.lockedUntil.toLocaleTimeString()}`,
    });
  }

  const valid = await argon2.verify(account.password, password);

  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    const updates: any = { failedLoginAttempts: attempts };

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + LOGIN_BLOCK_TIME * 60000);
      updates.lockedUntil = lockedUntil;
      updates.failedLoginAttempts = 0;

      await sendAccountLockedEmail(user.email, lockedUntil);
      await notifyAdminOnUserLock(user.email, lockedUntil);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updates,
    });

    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 días

  await prisma.session.create({
    data: {
      token,
      userId: account.user.id,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    },
  });

  return res.json({
    token,
    user: {
      id: account.user.id,
      name: account.user.name,
      email: account.user.email,
      role: account.user.roleId,
    },
  });
};


