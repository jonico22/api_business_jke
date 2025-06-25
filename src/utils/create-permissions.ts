import prisma from '../config/database';
import { logger } from './logger';

const permissions = [
  { name: 'create', description: 'Crear' },
  { name: 'read', description: 'Ver' },
  { name: 'update', description: 'Actualizar' },
  { name: 'delete', description: 'Eliminar' },
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
