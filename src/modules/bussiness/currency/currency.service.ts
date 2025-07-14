import { prisma } from "@/config/database";

export const currencyService = {
  create: (data: any) => prisma.currency.create({ data }),
  findAll: () => prisma.currency.findMany(),
  findById: (id: string) => prisma.currency.findUnique({ where: { id } }),
  update: (id: string, data: any) => prisma.currency.update({ where: { id }, data }),
  remove: (id: string) => prisma.currency.delete({ where: { id } }),
};