import prisma from '@/config/database';
import { RequestStatus } from '@prisma/client';

enum Status {
  Pending = "pending",
  Rejected = "rejected",
  Verified = "verified",
  Paid = "paid",
  Approved = "approved",
}

const status = Object.values(Status);

const isAprovedStatus = (value: any): value is RequestStatus => {
  
  return status.includes(value);
};

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
  updateStatus: (id: string, status: RequestStatus) =>
   
    prisma.request.update({ where: { id }, data: { status } }
  ),
  remove: (id: string) => prisma.request.delete({ where: { id } }),
};
