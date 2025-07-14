import prisma from '@/config/database';

export const planService = {
  create: (data: any) => prisma.plan.create({ data }),
  findAll: () =>
    prisma.plan.findMany({
      include: {
        service: true,
        paymentFrequency: true,
        currency: true,
      },
    }),
  findById: (id: string) =>
    prisma.plan.findUnique({
      where: { id },
      include: {
        service: true,
        paymentFrequency: true,
        currency: true,
      },
    }),
  update: (id: string, data: any) =>
    prisma.plan.update({ where: { id }, data }),
  remove: (id: string) => prisma.plan.delete({ where: { id } }),
};
