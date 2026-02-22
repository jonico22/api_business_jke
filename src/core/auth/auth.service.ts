import prisma from '@/config/database';
import {
  sendResetEmail, sendPasswordChangeEmail, sendResetByAdminEmail,
  sendAccountLockedEmail, notifyAdminOnUserLock
} from '@/utils/mailer';
import { hashToken, generateToken, generateRandomPassword, hashPassword } from '@/utils/hash';
import argon2 from 'argon2';
import { generateEmailToken } from '@/utils/token-email';
import { sendEmailVerification } from '@/utils/mailer';

export class AuthService {

  async verifySession(userId: string) {
    const MAX_SESSIONS = Number(process.env.MAX_SESSIONS_PER_USER || 2);
    const activeSessions = await prisma.session.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'asc' },
    });

    if (activeSessions.length >= MAX_SESSIONS) {
      // Elimina la sesión más antigua
      await prisma.session.delete({
        where: { id: activeSessions[0].id },
      });
    }
  }

  async login(email: string, password: string, userAgent: string, ipAddress: string) {
    const account = await prisma.account.findFirst({
      where: {
        accountId: email,
        providerId: 'credentials',
      },
      select: {
        id: true,
        password: true,
        user: { // Aquí seleccionas los campos de la relación
          select: {
            id: true,
            email: true,
            name: true,
            emailVerified: true,
            isActive: true,
            mustChangePassword: true,
            failedLoginAttempts: true,
            lockedUntil: true,
            role: { // Traemos el rol directamente desde aquí
              select: {
                code: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!account || !account.password) {
      throw new Error('Credenciales incorrectas');
    }

    const user = account.user;

    if (!user.emailVerified) {
      throw new Error('Debes verificar tu correo electrónico');
    }

    if (!user.isActive) {
      throw new Error('Cuenta inactiva');
    }

    if (await this.isUserBlocked(user.id)) {
      throw new Error('Cuenta bloqueada temporalmente');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new Error(`Cuenta bloqueada hasta ${user.lockedUntil.toLocaleTimeString()}`);
    }

    const valid = await argon2.verify(account.password, password);

    if (!valid) {
      const { attemptsLeft } = await this.incrementFailedAttempts(user.id, user.email);
      const message = attemptsLeft > 0 ? `Te quedan ${attemptsLeft} intentos.` : 'Has superado el número de intentos. Tu cuenta ha sido bloqueada temporalmente.';
      throw new Error(`Credenciales inválidas. ${message}`);
    }

    await this.resetFailedAttempts(user.id);

    await this.verifySession(user.id);
    // new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 días
    const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 2); // 2 horas
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: generateToken(),
        expiresAt: newExpiresAt,
        userAgent,
        ipAddress,
      },
      select: {
        id: true,
        token: true,
        expiresAt: true,
        userId: true,
        // No devolvemos userId ni ipAddress si no son necesarios
      }
    });

    console.log('[LOGIN] ✅ Login exitoso. Sesión creada:', session.id);

    return {
      token: session.token,
      user: account.user,
      newExpiresAt,
      role: user.role,
      session
      //views: await this.getViewsByRoleId(account.user.roleId || '') 
    };
  }

  async destroyAllByUser(userId: string) {
    await prisma.session.deleteMany({
      where: { userId },
    });
  }

  async logout(userId: string, sessionId: string) {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) {
      throw new Error('No autorizado');
    }
    if (userId) {
      // Elimina todas las sesiones del usuario
      await this.destroyAllByUser(userId);
    }
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const token = generateToken();
    const hashed = hashToken(token);
    const expires = new Date(Date.now() + 1000 * 60 * 15); // 30 minutos

    await prisma.passwordResetToken.create({
      data: { token: hashed, userId: user.id, expiresAt: expires },
    });

    await sendResetEmail(email, token);
  }

  async resetPassword(token: string, newPassword: string) {
    const hashed = hashToken(token);
    const reset = await prisma.passwordResetToken.findUnique({ where: { token: hashed } });
    if (!reset || reset.expiresAt < new Date()) throw new Error('Token inválido o expirado');

    const hashedPass = await hashPassword(newPassword);
    await prisma.account.updateMany({ where: { userId: reset.userId }, data: { password: hashedPass } });
    await prisma.user.update({ where: { id: reset.userId }, data: { mustChangePassword: false } });
    await prisma.passwordResetToken.delete({ where: { token: hashed } });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const account = await prisma.account.findFirst({ where: { userId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!account || !account.password) throw new Error('Cuenta inválida');

    const valid = await argon2.verify(account.password, currentPassword);
    if (!valid) throw new Error('Contraseña actual incorrecta');

    const hashedPass = await hashPassword(newPassword);
    if (!account.id) throw new Error('Cuenta inválida');
    await prisma.account.update({ where: { id: account.id }, data: { password: hashedPass } });
    await prisma.user.update({ where: { id: userId }, data: { mustChangePassword: false } });
    await sendPasswordChangeEmail(user?.email || '');
  }

  async isUserBlocked(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user?.lockedUntil && user.lockedUntil > new Date();
  }

  async incrementFailedAttempts(userId: string, email: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const attempts = (user?.failedLoginAttempts ?? 0) + 1;
    const max = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
    const blockMins = parseInt(process.env.LOGIN_BLOCK_TIME || '15');

    const attemptsLeft = Math.max(0, max - attempts);

    if (attempts >= max) {
      const lockedUntil = new Date(Date.now() + blockMins * 60000);
      await sendAccountLockedEmail(email, lockedUntil);
      await notifyAdminOnUserLock(email, lockedUntil);
    }
    const blockedUntil = attempts >= max ? new Date(Date.now() + blockMins * 60 * 1000) : null;
    await prisma.user.update({ where: { id: userId }, data: { failedLoginAttempts: attempts, lockedUntil: blockedUntil } });
    return { attemptsLeft };
  }

  async resetFailedAttempts(userId: string) {
    await prisma.user.update({ where: { id: userId }, data: { failedLoginAttempts: 0, lockedUntil: null } });
  }


  async getUserSessions(userId: string) {
    return prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteSessionById(userId: string, sessionId: string) {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) throw new Error('No autorizado');
    await prisma.session.delete({ where: { id: sessionId } });
  }

  async resetUserPassword(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });
    if (!user) throw new Error('Usuario no encontrado');
    const newPassword = generateRandomPassword();
    const hashedPassword = await argon2.hash(newPassword);
    await prisma.account.updateMany({
      where: { userId },
      data: { password: hashedPassword },
    });

    // No forzamos cambio de contraseña si es ADMIN
    if (user.role.code !== 'ADMIN') {
      await prisma.user.update({
        where: { id: userId },
        data: { mustChangePassword: true }
      });
    }

    await sendResetByAdminEmail(user.email, newPassword);
  }

  async getPermissionsByRoleId(roleId: string) {
    const permissions = await prisma.roleViewPermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
    return permissions.map((p: { permission: { name: any; }; }) => ({ name: p.permission.name }));
  }
  async getViewsByRoleId(roleId: string) {
    const views = await prisma.roleViewPermission.findMany({
      where: { roleId, permission: { name: 'read' } },
      include: { view: true, permission: true },
    });
    return views.map((v: { view: { name: any; }; permission: { name: any; }; }) => ({ name: v.view.name, permissions: v.permission ? { name: v.permission.name } : null }));
  }

  async getCurrentUser(sessionId: string) {
    if (!sessionId) throw new Error('No autorizado');

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });
    if (!session || !session.user || !session.user.isActive) throw new Error('Sesión inválida');
    const role = await prisma.role.findFirst({
      where: { users: { some: { id: session.userId } } },
    });
    return {
      user: session.user,
      expires: session.expiresAt,
      token: session.token,
      role,
    };
  }
  async verificationEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.emailVerified) {
      throw new Error('El correo ya fue verificado');
    }
    const token = generateEmailToken(user.email);
    await sendEmailVerification(email, token);
    return { message: 'Correo de verificación reenviado' };
  }

  async archiveUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isArchived: true,
      },
    });

    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    if (user.isArchived) {
      throw new Error("El usuario ya está archivado.");
    }

    const archivedEmail = `${user.email}.archived.${user.id}`;

    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        isDeleted: true,
        isArchived: true,
        email: archivedEmail,
        image: null,
        person: {
          disconnect: true,
        },
        failedLoginAttempts: 0,
        lockedUntil: null,
        sessions: {
          deleteMany: {},
        },
        resetTokens: {
          deleteMany: {},
        },
      },
    });

    return { success: true, message: "Usuario archivado correctamente." };
  }
}

export const authService = new AuthService();
