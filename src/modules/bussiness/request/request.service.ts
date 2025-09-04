import prisma from '@/config/database';
import { RequestStatus } from '@prisma/client';
import { createSociety} from '@/modules/customer/society/society.service';
import { userService } from '@/core/user/user.service';
import { roleService } from '@/core/role/role.service';
import { BranchOfficeService } from '@/modules/customer/branchOffice/branchoffice.service';
import { generateCodeUnique }  from '@/utils/generateCode'
import { generateRandomPassword } from '@/utils/hash';
import {sendRequestVerificationEmail, sendRegistrationEmail} from '@/utils/mailer';
import argon2 from 'argon2';

enum Status {
  Pending = "pending",
  Rejected = "rejected",
  Verified = "verified"
}

const newSociety = async (data: any) => {
  return await createSociety({
    code: `SOC-${generateCodeUnique()}`,
    name: data.businessName,
  })
}

const branchOffice = async (societyId: string) => {
  return await BranchOfficeService.create({
    name: "Oficina Principal",
    isMain: true,
    societyId,
  });
}

const planService = async (data: any) => {
  const tariff = await prisma.tariff.findUnique({
    where: { id: data.tariffId }
  });
  if (!tariff) throw new Error("Tarifa no encontrada");
  return await prisma.plan.findUnique({
    where: { id: tariff.planId }
  });
}
const newCreateUser = async (data: any,society:string) => {
  
  const plan = await planService(data);
  await roleService.create({
    code: `OWNER-${generateCodeUnique()}-${plan?.code}`,
    name: `titular`,
    societyId: society,
  });
  const newPassword = generateRandomPassword();
  const hashedPassword = await argon2.hash(newPassword);
  data.role = `OWNER-${generateCodeUnique()}-${plan?.code}`
  data.password = data.password || hashedPassword;
  data.typeBP = data.isBusiness ? "empresa" : "natural";
  data.documentNumber = data.documentNumber || "";
  return {
    user : await userService.createUser(data),
    password : newPassword
  }
};

export const requestService = {
  async create (data: any) {
    const verifyPhoneBussiness = await prisma.bussinessPartner.findFirst({
      where: { email: data.email }
    });
    if (data.email === verifyPhoneBussiness?.email) {
       return Promise.reject(new Error('El correo electronico ya está en uso'));
    }
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
    const society = await newSociety(request);
    await branchOffice(society.id);
    const {user,password} = await newCreateUser(request,society.id);
    await sendRequestVerificationEmail(request.email, request.code);
    await requestService.updateStatus(id, status);
    return request;
  },
  remove: (id: string) => prisma.request.delete({ where: { id } }),
};
