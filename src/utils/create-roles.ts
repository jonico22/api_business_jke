import prisma from '../config/database';

const defaultRoles = [
  { name: 'Administrador', code: 'ADMIN' },
  { name: 'Soporte', code: 'SUPPORT' },
  { name: 'Titular', code: 'OWNER' },
  { name: 'Colaborador', code: 'MEMBER' },
];

export const createDefaultRoles = async () => {
  for (const roleName of defaultRoles) {
    const exists = await prisma.role.findUnique({ where: { code: roleName.code } });
    if (!exists) {
      await prisma.role.create({ data: { name: roleName.name, code: roleName.code } });
      console.log(`🔧 Rol creado: ${roleName}`);
    }
  }
};

// STARTER_OWNER
// STARTER_MEMBER