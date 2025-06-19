import prisma from '../config/database';
import argon2 from 'argon2';

export const createInitialAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) return;

  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  if (!adminRole) throw new Error('Rol admin no existe. Ejecuta createDefaultRoles primero.');

  const hashed = await argon2.hash(adminPassword);

  await prisma.user.create({
    data: {
      name: 'Administrador',
      email: adminEmail,
      roleId: adminRole.id,
      isActive: true,
      accounts: {
        create: {
          accountId: adminEmail,
          providerId: 'credentials',
          password: hashed,
        },
      },
      person: {
        create: {
          firstName: 'Admin',
          lastName: 'Principal',
        },
      },
    },
  });

  console.log('👤 Usuario administrador creado:', adminEmail);
};
