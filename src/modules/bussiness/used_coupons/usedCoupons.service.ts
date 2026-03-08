import prisma from '@/config/database';
import { CreateCuponUsadoInput } from './usedCoupons.validation';

import { buildPagination } from '@/utils/query-filter';

export const cuponesUsadosService = {
  create: (data: CreateCuponUsadoInput) => {
    return prisma.usedCoupons.create({
      data: {
        userId: data.userId,
        promotionId: data.promocionId,
        subscriptionId: data.suscripcionId,
        usedAt: data.fechaUso,
      },
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

  findAll: async (societyId: string, query: any) => {
    const { skip, take, page, limit } = buildPagination(query);
    const where = { subscription: { societyId } };

    const [total, usedCoupons] = await Promise.all([
      prisma.usedCoupons.count({ where }),
      prisma.usedCoupons.findMany({
        where,
        skip,
        take,
        include: {
          user: true,
          promotion: true,
          subscription: true,
        },
        orderBy: { usedAt: 'desc' as const }
      })
    ]);

    return {
      data: usedCoupons,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};