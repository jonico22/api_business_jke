import prisma from '@/config/database';

export const subscriptionService = {
  create: (data: any) => prisma.subscription.create({ data }),
  findAll: () => prisma.subscription.findMany({
    include: { user: true, request: true },
  }),
  findById: (id: string) => prisma.subscription.findUnique({
    where: { id },
    include: { user: true, request: true },
  }),
  update: (id: string, data: any) => prisma.subscription.update({ where: { id }, data }),
  remove: (id: string) => prisma.subscription.delete({ where: { id } }),
};
