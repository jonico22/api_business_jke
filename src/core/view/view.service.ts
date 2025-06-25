// src/core/view/view.service.ts
import prisma from '@/config/database';

class ViewService {
  async create(data: { name: string; description?: string }) {
    const exists = await prisma.view.findUnique({ where: { name: data.name } });
    if (exists) throw new Error('La vista ya existe');

    return prisma.view.create({ data });
  }

  async getAll() {
    return prisma.view.findMany();
  }

  async update(id: string, data: { name: string; description?: string }) {
    return prisma.view.update({ where: { id }, data });
  }

  async remove(id: string) {
    return prisma.view.delete({ where: { id } });
  }
}

export const viewService = new ViewService();
