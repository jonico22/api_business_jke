// src/core/auth/auth.controller.ts
import { Request, Response } from 'express';
import { authService } from './auth.service';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from './auth.validation';
import { errorResponse, successResponse } from '@/utils/response';

import { sessionService } from "./session.service";
import { setSessionCookie } from "@/utils/cookies";

// Extend Express Request interface to include sessionId
declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      session?: { id: string; [key: string]: any }; // session is now an object with at least an id property
    }
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    const result = await authService.login(email, password, userAgent, ipAddress);
    res.cookie("session-token", result.token, {
      httpOnly: true,
      secure: false ,
      sameSite: "lax",
      path: "/",
      expires: result.newExpiresAt,
    });

    return successResponse(res, result, 'Login exitoso');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al iniciar sesión', 401, errorMessage);
  }
};
export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.sessionId;
    if (!userId || !sessionId) {
      return res.status(400).json({ error: 'User ID or session ID is missing' });
    }
    await authService.logout(userId, sessionId);
       // Limpia la cookie
    res.clearCookie("session-token", {
      httpOnly: true,
      secure: false ,
      sameSite: "lax",
      //secure: process.env.NODE_ENV === "production",
      //sameSite: "none",
      path: "/",
    });
    res.json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: errorMessage });
  }
}

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

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionId;
    if (!sessionId) {
      return res.status(401).json({ error: 'No autorizado: sessionId faltante' });
    }
    const result = await authService.getCurrentUser(sessionId);
    res.cookie('auth.session', result.token, {
      httpOnly: true,
      secure: false ,
      //secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: result.expires,
    });
     return successResponse(res, result, 'datos del usuario exitoso');
  } catch (error) {
    return res.status(500).json({ error: 'Error al recuperar usuario' });
  }
};

export const refreshSession = async (req: Request, res: Response) => {
  try {
    const session = req.session;
    if (!session?.id) {
      return res.status(401).json({ error: "Sesión no válida" });
    }

    const renewed = await sessionService.renew(session.id);
    if (!renewed) {
      return res.status(401).json({ error: "No se pudo renovar sesión" });
    }

    setSessionCookie(res, renewed.token, renewed.expiresAt);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "Error al renovar sesión" });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const result = await authService.verificationEmail(email);
    return successResponse(res, result, 'Correo de verificación reenviado');
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al reenviar correo' });
  }
};
