import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { redis } from '@/shared/services/redis.service';

const SESSION_CACHE_TTL = 300; // 5 minutos en segundos

/**
 * Invalida la caché de sesión en Redis.
 * Llamar al hacer logout, cambio de rol, o desactivar usuario.
 */
export const invalidateSessionCache = async (token: string) => {
  await redis.del(`session:${token}`);
};

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Extracción del token de forma priorizada
    const token =
      req.cookies?.['session-token'] ||
      req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No autorizado: Token no proporcionado' });
    }

    // 2. Intentar leer de Redis primero (≈1ms vs ≈70ms de BD)
    const cacheKey = `session:${token}`;
    const cached = await redis.get<{
      sessionId: string;
      user: any;
      roleCode: string;
      societyId: string | null;
      subscriptionId: string | null;
      expiresAt: string;
    }>(cacheKey);

    if (cached) {
      // Validar expiración
      if (new Date(cached.expiresAt) < new Date()) {
        await redis.del(cacheKey);
        return res.status(401).json({ message: 'Sesión expirada' });
      }

      req.user = cached.user;
      req.role = cached.roleCode;
      req.sessionId = cached.sessionId;
      req.societyId = cached.societyId;
      req.subscriptionId = cached.subscriptionId;
      return next();
    }

    // 3. Cache miss → Buscar en BD
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          include: { role: true }
        }
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Sesión inválida o expirada' });
    }

    if (!session.user || !session.user.isActive) {
      return res.status(401).json({ message: 'Usuario inactivo' });
    }

    // 4. Resolver subscriptionId en la misma pasada
    let subscriptionId: string | null = null;
    const societyId = session.user.role.societyId;

    if (societyId) {
      const subscription = await prisma.subscription.findUnique({
        where: { societyId },
        select: { id: true }
      });
      subscriptionId = subscription?.id || null;
    }

    // 5. Inyectar datos en req
    req.user = session.user;
    req.role = session.user.role.code;
    req.sessionId = session.id;
    req.session = session;
    req.societyId = societyId;
    req.subscriptionId = subscriptionId;

    // 6. Guardar en Redis para las próximas peticiones
    await redis.set(cacheKey, {
      sessionId: session.id,
      user: session.user,
      roleCode: session.user.role.code,
      societyId,
      subscriptionId,
      expiresAt: session.expiresAt.toISOString(),
    }, SESSION_CACHE_TTL);

    next();
  } catch (error) {
    console.error('[AuthMiddleware Error]:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error interno de autenticación' });
    }
  }
};

export default auth;

/**
 * Middleware para asegurar que el usuario tenga un Rol específico
 * Útil para proteger rutas exclusivas de ADMIN o OWNER
 */
export const isRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.role) {
      return res.status(403).json({ message: 'No tienes el rol requerido para esta acción' });
    }

    // Comprobar si el req.role coincide exactamente o empieza con alguno de los permitidos seguido de un guión
    // Ej: allowedRoles = ['OWNER'] -> permite 'OWNER' o 'OWNER-SOC-123'
    const hasRole = allowedRoles.some(allowed =>
      req.role === allowed || req.role.startsWith(`${allowed}-`)
    );

    if (!hasRole) {
      return res.status(403).json({ message: 'No tienes el rol requerido para esta acción' });
    }
    next();
  };
};

/**
 * Middleware Híbrido de Seguridad
 * Valida tanto el Permiso sobre la Vista como el estado de la Suscripción
 */
export const checkPermission = (requiredView: string, requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const roleId = req.user?.roleId;

      if (!userId || !roleId) {
        return res.status(401).json({ message: 'Usuario no autenticado correctamente' });
      }

      // 1. Validar Suscripción Activa (Solo si el usuario pertenece a una sociedad y no es ADMIN interno)
      if (req.societyId && req.role !== 'ADMIN' && req.role !== 'SUPPORT') {
        const subscription = await prisma.subscription.findUnique({
          where: { societyId: req.societyId },
          select: { status: true }
        });

        if (!subscription || subscription.status !== 'ACTIVE') {
          return res.status(403).json({
            message: 'Acceso denegado: La suscripción de este negocio no está activa.',
            code: 'SUBSCRIPTION_INACTIVE'
          });
        }
      }

      // 2. Si el rol es el Super ADMIN interno, podemos dejarlo pasar (opcional temporal)
      if (req.role === 'ADMIN') {
        return next();
      }

      // 3. Buscar en BD si el Rol tiene el permiso requerido (RoleViewPermission)
      const rolePerm = await prisma.roleViewPermission.findFirst({
        where: {
          roleId,
          view: { code: requiredView },
          permission: { name: requiredPermission },
          isActive: true
        }
      });

      if (rolePerm) {
        return next(); // ✅ Tiene permiso por Rol
      }

      // 4. Buscar si el Usuario tiene un permiso especial aditivo (UserViewPermission)
      const userPerm = await prisma.userViewPermission.findFirst({
        where: {
          userId,
          view: { code: requiredView },
          permission: { name: requiredPermission },
          isActive: true
        }
      });

      if (userPerm) {
        return next(); // ✅ Tiene permiso aditivo directo
      }

      // ❌ Ninguna condición se cumplió, Acceso denegado
      return res.status(403).json({
        message: `No tienes permiso para ${requiredPermission} en la vista ${requiredView}`
      });

    } catch (error) {
      console.error('[CheckPermission Middleware Error]:', error);
      res.status(500).json({ message: 'Error interno validando permisos' });
    }
  };
};