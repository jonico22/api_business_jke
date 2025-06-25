// src/core/auth/auth.controller.ts
import { Request, Response } from 'express';
import { authService } from './auth.service';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from './auth.validation';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const result = await authService.login(email, password, userAgent, ipAddress);
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(401).json({ error: errorMessage });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    await authService.forgotPassword(email);
    res.json({ message: 'Revisa tu correo para cambiar la contraseña' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: errorMessage });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    await authService.resetPassword(token, newPassword);
    res.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: errorMessage });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = req.user?.id;
    await authService.changePassword(userId, currentPassword, newPassword);
    res.json({ message: 'Contraseña cambiada correctamente' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: errorMessage });
  }
};

export const listSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const sessions = await authService.getUserSessions(userId);
    res.json(sessions);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: errorMessage });
  }
};

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.params.id;
    await authService.deleteSessionById(userId, sessionId);
    res.json({ message: 'Sesión eliminada' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: errorMessage });
  }
};

export const resetUserPassword = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    await authService.resetUserPassword(userId);
    res.json({ message: 'Contraseña reseteada y enviada al usuario' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: errorMessage });
  }
}