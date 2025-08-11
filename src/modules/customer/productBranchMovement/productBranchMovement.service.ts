import { Prisma } from '@prisma/client';
import prisma from '@/config/database';

export class ProductBranchMovementService {
  static async getAll(filters: Partial<Prisma.ProductBranchMovementWhereInput> = {}) {
    return prisma.productBranchMovement.findMany({
      where: filters,
      include: {
        originBranch: true,
        destinationBranch: true,
        product: true,
      },
      orderBy: { movementDate: 'desc' },
    });
  }

  static async getById(id: string) {
    return prisma.productBranchMovement.findUnique({
      where: { id },
      include: {
        originBranch: true,
        destinationBranch: true,
        product: true,
      },
    });
  }

  static async create(data: Prisma.ProductBranchMovementCreateInput) {
    return prisma.productBranchMovement.create({ data });
  }

  static async update(id: string, data: Prisma.ProductBranchMovementUpdateInput) {
    return prisma.productBranchMovement.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.productBranchMovement.delete({
      where: { id },
    });
  }
}
