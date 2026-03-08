import prisma from '../config/database';

const defaultRoles = [
  // --- ROLES DE ADMINISTRACIÓN DEL SAAS (Equipo interno) ---
  { name: 'Administrador', code: 'ADMIN' },
  { name: 'Soporte Técnico', code: 'SUPPORT' },

  // --- ROLES DE LOS NEGOCIOS/SUSCRIPTORES ---
  { name: 'Titular de cuenta', code: 'OWNER' },
  { name: 'Administrador Local', code: 'BUSINESS_MANAGER' },
  { name: 'Ejecutivo de ventas', code: 'SELLER' },
  { name: 'Operario de almacén', code: 'STOCK_MANAGER' },
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