import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { cache } from '../utils/cache';

interface AccessCheck {
  viewName: string;
  permissionName: string;
}

// Middleware que valida si el usuario tiene acceso a la vista con el permiso requerido
export const checkAccess = ({viewName, permissionName}:AccessCheck) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user; // debe estar poblado por el middleware auth.middleware.ts
      if (!user) return res.status(401).json({ message: 'No autenticado' });

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          role: true,
        },
      });

      if (!dbUser || !dbUser.roleId  || !dbUser.role) {
        logger.warn(`❌ Usuario sin rol. ID: ${user.id}`);
        return res.status(403).json({ message: 'Rol no definido' });
      }

      const cacheKey = `${dbUser.roleId}_${viewName}_${permissionName}`;
      const cachedAccess = cache.get<boolean>(cacheKey);

      if (cachedAccess !== undefined) {
        if (cachedAccess) {
          logger.info(`✅ Acceso (CACHÉ): ${dbUser.role.name} → ${viewName} / ${permissionName}`);
          return next();
        } else {
          logger.warn(`❌ Acceso denegado (CACHÉ): ${dbUser.role.name} → ${viewName} / ${permissionName}`);
          return res.status(403).json({ message: 'Acceso denegado (caché)' });
        }
      }

      const access = await prisma.roleViewPermission.findFirst({
        where: {
          roleId: dbUser.roleId,
          view: { name: viewName },
          permission: { name: permissionName },
        },
      });

      const hasAccess = !!access;
      cache.set(cacheKey, hasAccess);

       if (hasAccess) {
        logger.info(`✅ Acceso (DB): ${dbUser.role.name} → ${viewName} / ${permissionName}`);
        return next();
      } else {
        logger.warn(`❌ Acceso denegado (DB): ${dbUser.role.name} → ${viewName} / ${permissionName}`);
        return res.status(403).json({ message: 'Acceso denegado' });
      }
    } catch (error) {
      logger.error(`Error en checkAccess: ${error}`);
      res.status(500).json({ message: 'Error interno de servidor' });
    }
  };
};
