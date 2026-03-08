import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';


const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Extracción del token de forma priorizada
    const token =
      req.cookies?.['session-token'] ||
      req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No autorizado: Token no proporcionado' });
    }

    // 2. Búsqueda en base de datos
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          include: { role: true }
        }
      },
    });

    // 3. Validación de vigencia
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Sesión inválida o expirada' });
    }

    // 4. Inyección de datos en el objeto Request
    req.user = session.user;
    req.role = session.user.role.code;
    req.sessionId = session.id;
    req.session = session;
    req.societyId = session.user.role.societyId;

    // 5. Inyección del subscriptionId (UUID) para optimizar Core
    if (req.societyId) {
      const subscription = await prisma.subscription.findUnique({
        where: { societyId: req.societyId },
        select: { id: true }
      });
      req.subscriptionId = subscription?.id;
    }

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