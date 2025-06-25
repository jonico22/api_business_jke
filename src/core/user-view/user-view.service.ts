// src/core/user_view/user-view.service.ts
import prisma from '@/config/database';

class UserViewService {
  async assign(data: { userId: string; viewId: string; permissionId: string }) {
    const { userId, viewId, permissionId } = data;
    const existing = await prisma.userViewPermission.findFirst({
      where: { userId, viewId, permissionId },
    });

    if (existing) throw new Error('Ya asignado');
    return prisma.userViewPermission.create({ data });
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
    return prisma.userViewPermission.delete({ where: { id } });
  }
}

export const userViewService = new UserViewService();
