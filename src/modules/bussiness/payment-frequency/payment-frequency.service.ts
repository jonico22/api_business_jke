import { prisma } from "@/config/database";

export const paymentFrequencyService = {
  create: (data: any) => prisma.paymentFrequency.create({ data }),
  findAll: () => prisma.paymentFrequency.findMany(),
  findById: (id: string) =>
    prisma.paymentFrequency.findUnique({ where: { id } }),
  update: (id: string, data: any) =>
    prisma.paymentFrequency.update({ where: { id }, data }),
  remove: (id: string) =>
    prisma.paymentFrequency.delete({ where: { id } }),
};
