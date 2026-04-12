import { Request, Response, NextFunction } from 'express';
import { envs } from '@/config/envs';
import { logger } from '@/utils/logger';

/**
 * Middleware para validar el token de Cloudflare Turnstile.
 * Se puede enviar en el header 'x-turnstile-token' o en el body como 'turnstileToken'.
 */
export const validateTurnstile = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Extraer token de headers o body
  const token = req.headers['x-turnstile-token'] || req.body?.turnstileToken;
  const canUseBypass = envs.isTest || envs.CI;

  // En entornos de pruebas/CI permitimos un token estático para evitar llamadas a Cloudflare.
  if (canUseBypass && token === envs.TURNSTILE_BYPASS_TOKEN) {
    logger.info('[TurnstileMiddleware]: Bypass de Turnstile aplicado en entorno test/CI.');
    return next();
  }

  // 2. Si no hay Secret Key, logueamos advertencia y permitimos (evita romper la app si no está configurado)
  if (!envs.TURNSTILE_SECRET_KEY) {
    logger.warn('[TurnstileMiddleware]: TURNSTILE_SECRET_KEY no configurada. Saltando validación.');
    return next();
  }

  // 3. Si no hay token y la key está configurada, es obligatorio
  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'Token de seguridad (Turnstile) es obligatorio para esta acción.'
    });
  }

  try {
    // 4. Verificar con la API de Cloudflare
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: envs.TURNSTILE_SECRET_KEY,
        response: token as string,
        remoteip: req.ip || '',
      }),
    });

    const data: any = await response.json();

    // 5. Manejar resultado de validación
    if (!data.success) {
      logger.error(`[TurnstileMiddleware] Validación fallida para IP ${req.ip}. Errores: ${JSON.stringify(data['error-codes'])}`);
      return res.status(403).json({
        success: false,
        message: 'Validación de seguridad fallida. Por favor, inténtalo de nuevo.',
        errors: data['error-codes']
      });
    }

    // ✅ Validación exitosa
    next();
  } catch (error) {
    logger.error('[TurnstileMiddleware] Error verificando token:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno validando el token de seguridad.'
    });
  }
};
