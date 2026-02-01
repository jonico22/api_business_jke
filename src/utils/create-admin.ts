import prisma from '../config/database';
import argon2 from 'argon2';

export const createInitialAdmin = async () => {

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!';

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { accounts: true, role: true }
  });

  const adminRole = await prisma.role.findUnique({ where: { code: 'ADMIN' } });
  if (!adminRole) throw new Error('Rol admin no existe. Ejecuta createDefaultRoles primero.');

  const hashed = await argon2.hash(adminPassword);

  if (existing) {
    // Actualizar usuario existente
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        emailVerified: true,
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        roleId: adminRole.id,
      }
    });

    // Actualizar o crear account
    if (existing.accounts.length > 0) {
      await prisma.account.update({
        where: { id: existing.accounts[0].id },
        data: { password: hashed }
      });
    } else {
      await prisma.account.create({
        data: {
          accountId: adminEmail,
          providerId: 'credentials',
          password: hashed,
          userId: existing.id
        }
      });
    }

    console.log('✅ Usuario administrador actualizado:', adminEmail);
    return;
  }

  await prisma.user.create({
    data: {
      name: 'Administrador',
      email: adminEmail,
      roleId: adminRole.id,
      isActive: true,
      emailVerified: true,
      accounts: {
        create: {
          accountId: adminEmail,
          providerId: 'credentials',
          password: hashed,
        },
      },
      person: {
        create: {
          typeBP: 'natural',
          firstName: 'Admin',
          lastName: 'Principal',
          email: adminEmail,
          phone: '123456789', // Add a default or valid phone value here
        },
      },
    },
  });

  console.log('✅ Usuario administrador creado:', adminEmail);
};
