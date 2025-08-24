import prisma from '@/config/database';
import { RequestStatus } from '@prisma/client';
import { userService } from '@/core/user/user.service';
import { generateCodeUnique }  from '@/utils/generateCode'
import { generateRandomPassword } from '@/utils/hash';
import {sendRequestVerificationEmail, sendRegistrationEmail} from '@/utils/mailer';
import argon2 from 'argon2';

enum Status {
  Pending = "pending",
  Rejected = "rejected",
  Verified = "verified"
}

const newCreateUser = async (data: any) => {
  const newPassword = generateRandomPassword();
  const hashedPassword = await argon2.hash(newPassword);
  data.role = "titular"
  data.password = data.password || hashedPassword;
  data.typeBP = data.isBusiness ? "empresa" : "natural";
  data.documentNumber = data.documentNumber || "";
  userService.createUser(data);
};

export const requestService = {
  create (data: any) {
    if (!data.code) {
      data.code = `REQ-${generateCodeUnique()}`;
    }

    sendRegistrationEmail(data.email, data.firstName, data.lastName, data.code);
    return prisma.request.create({ data });
  },
  findAll: () => prisma.request.findMany({
    include: { tariff: true },
    orderBy: { createdAt: "desc" },
  }),

  findById: (id: string) =>
    prisma.request.findUnique({
      where: { id },
      include: { tariff: true },
      // Ensure 'code' is selected
    }),
  update: (id: string, data: any) =>
    prisma.request.update({ where: { id }, data }),
  updateStatus: (id: string, status: RequestStatus) =>
    prisma.request.update({ where: { id }, data: { status } }
  ),
  updateStatusVerified: async (id: string, status: RequestStatus) => {
    const request = await requestService.findById(id);
    if (!request) throw new Error("Solicitud no encontrada");
    if (Status.Verified !== RequestStatus.verified) {
      throw new Error("La solicitud no está en estado verificado");
    }
    await newCreateUser(request);
    await sendRequestVerificationEmail(request.email, request.code);
    await requestService.updateStatus(id, status);
    return request;
  },
  remove: (id: string) => prisma.request.delete({ where: { id } }),
};
