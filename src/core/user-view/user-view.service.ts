// src/core/user_view/user-view.service.ts
import prisma from '@/config/database';
import { invalidatePermissionCacheByUser } from '@/middlewares/auth.middleware';

class UserViewService {
  async assign(data: { userId: string; viewId: string; permissionId: string }) {
    const { userId, viewId, permissionId } = data;
    const existing = await prisma.userViewPermission.findFirst({
      where: { userId, viewId, permissionId },
    });

    if (existing) throw new Error('Ya asignado');
    const result = await prisma.userViewPermission.create({ data });
    await invalidatePermissionCacheByUser(userId);
    return result;
  }

  async getAll() {
    return prisma.userViewPermission.findMany({
      include: {
        user: true,
        view: true,
        permission: true,
      },
    });
  }

  async getByUserPermission(userId: string) {
    return prisma.userViewPermission.findMany({
      where: { userId },
      include: {
        view: true,
        permission: true,
      },
    });
  }

  async remove(id: string) {
    const existing = await prisma.userViewPermission.findUnique({
      where: { id },
      select: { userId: true }
    });
    const result = await prisma.userViewPermission.delete({ where: { id } });
    if (existing?.userId) {
      await invalidatePermissionCacheByUser(existing.userId);
    }
    return result;
  }
}

export const userViewService = new UserViewService();
