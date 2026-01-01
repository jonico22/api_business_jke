import prisma from '@/config/database';

export class TariffService {
  async create(data: any) {
    return prisma.tariff.create({ data });
  }

  async findAll(filters?: any) {
    return prisma.tariff.findMany({
      where: {
        isActive: filters?.isActive,
        planId: filters?.planId,
        promotionId: filters?.promotionId
      },
      include: {
        plan: true,
        promotion: true
      }
    });
  }

  async findById(id: string) {
    return prisma.tariff.findUnique({
      where: { id },
      include: {
        plan: true,
        promotion: true
      }
    });
  }

  async update(id: string, data: any) {
    return prisma.tariff.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.tariff.update({
      where: { id },
      data: { isActive: false } // Baja lógica
    });
  }
}
