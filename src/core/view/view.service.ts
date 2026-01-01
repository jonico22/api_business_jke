// src/core/view/view.service.ts
import prisma from '@/config/database';

class ViewService {
  async create(data: { name: string; description?: string }) {
    const exists = await prisma.view.findFirst({ where: { name: data.name } });
    if (exists) throw new Error('La vista ya existe');

    const code = data.name.toLowerCase().replace(/\s+/g, '-');
    return prisma.view.create({ data: { ...data, code } });
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
