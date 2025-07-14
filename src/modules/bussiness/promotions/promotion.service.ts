import prisma from '@/config/database';

export const promotionService = {
  create: (data: any) => prisma.promotion.create({ data }),
  findAll: () => prisma.promotion.findMany(),
  findById: (id: string) => prisma.promotion.findUnique({ where: { id } }),
  update: (id: string, data: any) => prisma.promotion.update({ where: { id }, data }),
  remove: (id: string) => prisma.promotion.delete({ where: { id } }),
};