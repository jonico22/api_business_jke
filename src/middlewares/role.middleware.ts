import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export const allowRoles = (...allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'No autenticado' });

    const normalizedAllowedRoles = allowedRoles.map(role => role.trim().toUpperCase());
    const currentRole = typeof req.role === 'string' ? req.role.trim().toUpperCase() : null;

    if (currentRole) {
      const hasAccess = normalizedAllowedRoles.includes(currentRole);
      if (!hasAccess) {
        logger.warn(`❌ Acceso denegado: ${req.role} no permitido → ruta ${req.originalUrl}`);
        return res.status(403).json({ message: 'Acceso denegado: Rol insuficiente' });
      }

      return next();
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });

    if (!dbUser || !dbUser.role) {
      logger.warn(`❌ Usuario sin rol. ID: ${user.id}`);
      return res.status(403).json({ message: 'Rol no asignado' });
    }

    const roleCode = dbUser.role.code.trim().toUpperCase();
    const hasAccess = normalizedAllowedRoles.includes(roleCode);
    if (!hasAccess) {
      logger.warn(`❌ Acceso denegado: ${dbUser.role.code} no permitido → ruta ${req.originalUrl}`);
      return res.status(403).json({ message: 'Acceso denegado: Rol insuficiente' });
    }

    next();
  };
};
