import { prisma } from '@/config/database';
import { Service } from '@prisma/client';

export const serviceService = {
  async create(data: Partial<Service>) {
    return prisma.service.create({ data });
  },

  async findAll() {
    return prisma.service.findMany();
  },

  async findById(id: string) {
    return prisma.service.findUnique({ where: { id } });
  },

  async update(id: string, data: Partial<Service>) {
    return prisma.service.update({ where: { id }, data });
  },

  async remove(id: string) {
    return prisma.service.delete({ where: { id } });
  },
};
