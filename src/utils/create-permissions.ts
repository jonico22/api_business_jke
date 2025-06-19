import prisma from '../config/database';
import { logger } from './logger';

const permissions = [
  { name: 'user:create', description: 'Crear usuario' },
  { name: 'user:read', description: 'Ver usuario' },
  { name: 'user:update', description: 'Actualizar usuario' },
  { name: 'user:delete', description: 'Eliminar usuario' },
  { name: 'role:manage', description: 'Gestionar roles y permisos' },
];

export const createPermissions = async () => {
  for (const perm of permissions) {
    const exists = await prisma.permission.findUnique({ where: { name: perm.name } });
    if (!exists) {
      await prisma.permission.create({ data: perm });
      logger.info(`Permiso creado: ${perm.name}`);
    }
  }
};
