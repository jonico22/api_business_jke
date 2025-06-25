// src/core/permission/permission.service.ts
import prisma from '@/config/database';

class PermissionService {
  async create(data: { name: string; description?: string }) {
    const exists = await prisma.permission.findUnique({ where: { name: data.name } });
    if (exists) throw new Error('El permiso ya existe');

    return prisma.permission.create({ data });
  }

  async getAll() {
    return prisma.permission.findMany();
  }

  async update(id: string, data: { name: string; description?: string }) {
    return prisma.permission.update({ where: { id }, data });
  }

  async remove(id: string) {
    return prisma.permission.delete({ where: { id } });
  }
}

export const permissionService = new PermissionService();
