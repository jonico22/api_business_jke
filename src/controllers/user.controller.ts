import { Request, Response } from 'express';
import prisma from '../config/database';
import { updateMeSchema,createUserSchema } from '../validations/user.validation';

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({ include: { role: true, person: true } });
  res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
  const data = createUserSchema.parse(req.body);

  const emailExists = await prisma.user.findUnique({ where: { email: data.email } });
  if (emailExists) return res.status(409).json({ message: 'El email ya está registrado' });

  const role = await prisma.role.findUnique({ where: { name: data.role } });
  if (!role) return res.status(400).json({ message: 'Rol no válido' });

  const hashedPassword = await argon2.hash(data.password);

  const newUser = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      emailVerified: false,
      roleId: role.id,
      accounts: {
        create: {
          accountId: data.email,
          providerId: 'credentials',
          password: hashedPassword,
        },
      },
      person: {
        create: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          address: data.address,
        },
      },
    },
    include: { role: true, person: true },
  });

  res.status(201).json(newUser);
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true, person: true },
  });
  res.json(user);
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const data = updateMeSchema.parse(req.body);

  const person = await prisma.person.upsert({
    where: { userId },
    update: data,
    create: { ...data, userId },
  });

  res.json({ message: 'Perfil actualizado', person });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const requester = req.user;

  if (requester.role.name !== 'admin') {
    return res.status(403).json({ message: 'No autorizado' });
  }

  await prisma.user.delete({ where: { id } });
  res.json({ message: 'Usuario eliminado' });
};

export const activateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const requester = req.user;

  if (!['admin', 'soporte'].includes(requester.role.name)) {
    return res.status(403).json({ message: 'No autorizado para activar usuarios' });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isActive: true },
  });

  res.json({ message: 'Usuario activado', user });
};

export const unlockUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const requester = req.user;

  if (!['admin', 'soporte'].includes(requester.role.name)) {
    return res.status(403).json({ message: 'No autorizado para desbloquear usuarios' });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  res.json({ message: 'Usuario desbloqueado', user: updated });
};

export const deleteUserSessions = async (req: Request, res: Response) => {
  const requester = req.user;
  const sessionId = (req as any).sessionId;
  const { id: targetUserId } = req.params;

  if (!['admin', 'soporte'].includes(requester.role.name)) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  const allSessions = await prisma.session.findMany({
    where: { userId: targetUserId },
  });

  const sessionsToDelete = allSessions.filter((s) => s.id !== sessionId);

  await prisma.session.deleteMany({
    where: {
      id: { in: sessionsToDelete.map((s) => s.id) },
    },
  });

  res.json({
    message: `Se cerraron ${sessionsToDelete.length} sesiones del usuario`,
  });
};

