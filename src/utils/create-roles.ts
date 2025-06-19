import prisma from '../config/database';

const defaultRoles = ['admin', 'soporte', 'cliente', 'colaborador'];

export const createDefaultRoles = async () => {
  for (const roleName of defaultRoles) {
    const exists = await prisma.role.findUnique({ where: { name: roleName } });
    if (!exists) {
      await prisma.role.create({ data: { name: roleName } });
      console.log(`🔧 Rol creado: ${roleName}`);
    }
  }
};
