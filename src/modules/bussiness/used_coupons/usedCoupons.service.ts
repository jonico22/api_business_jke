import { prisma } from "@/config/database";
import { CreateCuponUsadoInput } from './usedCoupons.validation';

export const cuponesUsadosService = {
  create: (data: CreateCuponUsadoInput) => {
    return prisma.UsedCoupons.create({
      data,
    });
  },

  findByUserAndPromocion: (userId: string, promocionId: string) => {
    return prisma.UsedCoupons.findFirst({
      where: {
        userId,
        promocionId,
      },
    });
  },

  findAll: () => {
    return prisma.UsedCoupons.findMany({
      include: {
        user: true,
        promocion: true,
        suscripcion: true,
      },
    });
  },
};