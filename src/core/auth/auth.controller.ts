// src/core/auth/auth.controller.ts
import { Request, Response } from 'express';
import { authService } from './auth.service';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from './auth.validation';
import { errorResponse, successResponse } from '@/utils/response';

import { sessionService } from "./session.service";
import { setSessionCookie } from "@/utils/cookies";

// Definimos si estamos en producción una sola vez
const isProduction = process.env.NODE_ENV === 'production';

export const login = async (req: Request, res: Response) => {
  try {
    // 1. Validación de esquema
    console.log("Cuerpo recibido:", req.body);
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return errorResponse(res, 'Datos de entrada inválidos', 400, validation.error.format());
    }

    const { email, password } = validation.data;
    const userAgent = req.headers['user-agent'] || 'unknown';

    // 2. Obtención de IP (priorizando proxies confiables)
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';

    // 3. Lógica de negocio
    const result = await authService.login(email, password, userAgent, ipAddress);

    // 4. Configuración de la Cookie
    res.cookie("session-token", result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      expires: result.newExpiresAt,
    });

    return successResponse(res, result, 'Login exitoso');

  } catch (error: any) {
    // Diferenciar errores de autenticación (401) de errores de servidor (500)
    const status = error.status || 401;
    const message = error.message || 'Error al iniciar sesión';

    return errorResponse(res, message, status, isProduction ? undefined : error.stack);
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
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
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

    // Configuración dinámica de la cookie
    res.cookie("session-token", result.token, {
      httpOnly: true,
      // En producción DEBE ser true (requiere HTTPS)
      secure: isProduction,
      // 'none' permite enviar cookies entre dominios distintos (ej: api.com y app.com)
      // pero solo funciona si 'secure' es true. En dev usamos 'lax'.
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      expires: result.expires,
    });

    return successResponse(res, result, 'Datos del usuario obtenidos con éxito');
  } catch (error) {
    console.error('[GetCurrentUser Error]:', error);
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
    return res.json({ token: renewed.token, expiresAt: renewed.expiresAt });
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

export const archiveUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const result = await authService.archiveUser(userId);
    return successResponse(res, result, 'Usuario archivado correctamente');
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al archivar usuario' });
  }
};

export const getMyPermissions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const roleId = req.user?.roleId;

    if (!userId || !roleId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const permissions = await authService.getMyPermissions(userId, roleId);
    return successResponse(res, permissions, 'Permisos obtenidos correctamente');
  } catch (error) {
    console.error('[GetMyPermissions Error]:', error);
    return res.status(500).json({ message: 'Error interno obteniendo permisos' });
  }
};

