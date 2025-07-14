import prisma from '@/config/database';
import { CreateCuponUsadoInput } from './usedCoupons.validation';

export const cuponesUsadosService = {
  create: (data: CreateCuponUsadoInput) => {
    return prisma.usedCoupons.create({
      data,
    });
  },

  findByUserAndPromocion: (userId: string, promotionId: string) => {
    return prisma.usedCoupons.findFirst({
      where: {
        userId,
        promotionId,
      },
    });
  },

  findAll: () => {
    return prisma.usedCoupons.findMany({
      include: {
        user: true,
        promotion: true,
        subscription: true,
      },
    });
  },
};