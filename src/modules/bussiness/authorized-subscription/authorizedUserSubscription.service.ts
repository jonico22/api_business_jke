import { prisma } from '@/config/prisma';
import { CreateAuthorizedUserSubscriptionDTO } from './authorizedUserSubscription.validation';

export const authorizedUserSubscriptionService = {
  add: async (data: CreateAuthorizedUserSubscriptionDTO) => {
    return prisma.authorizedUserSubscription.create({ data });
  },

  findAll: async () => {
    return prisma.authorizedUserSubscription.findMany({
      include: {
        user: true,
        subscription: true,
      },
    });
  },

  remove: async (id: string) => {
    return prisma.authorizedUserSubscription.delete({ where: { id } });
  },
};