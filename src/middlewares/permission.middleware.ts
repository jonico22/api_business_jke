import { Request, Response, NextFunction } from 'express';
import { hasCombinedPermission } from '../utils/permission-check';
import { logger } from '../utils/logger';

export const requirePermission = (view: string, permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'No autenticado' });

    const allowed = await hasCombinedPermission(user.id, view, permission);
    if (!allowed) {
      logger.warn(`❌ Acceso denegado: ${user.email} → ${view}.${permission}`);
      return res.status(403).json({ message: 'No tienes permiso para acceder a esta sección' });
    }

    next();
  };
};

