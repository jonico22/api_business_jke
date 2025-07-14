import { prisma } from "@/config/database";

export const requestService = {
  create: (data: any) => prisma.request.create({ data }),

  findAll: () => prisma.request.findMany({
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  }),

  findById: (id: string) =>
    prisma.request.findUnique({
      where: { id },
      include: { plan: true },
    }),

  update: (id: string, data: any) =>
    prisma.request.update({ where: { id }, data }),

  remove: (id: string) => prisma.request.delete({ where: { id } }),
};

