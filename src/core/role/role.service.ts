// src/core/role/role.service.ts
import prisma from '@/config/database';

class RoleService {
  async create(data: { name: string; code: string }) {
    const exists = await prisma.role.findUnique({ where: { name: data.name } });
    if (exists) throw new Error('El rol ya existe');

    return prisma.role.create({ data });
  }

  async getAll() {
    return prisma.role.findMany();
  }

  async update(id: string, data: { name: string; code?: string }) {
    return prisma.role.update({ where: { id }, data });
  }

  async remove(id: string) {
    return prisma.role.delete({ where: { id } });
  }
}

export const roleService = new RoleService();
