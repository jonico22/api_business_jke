// src/core/user/user.service.ts
import prisma from '@/config/database';
import { hashPassword } from '@/utils/hash';
import { createUserSchema, updateMeSchema } from './user.validation';


class UserService {
    async createUser(data: any) {
        const response = createUserSchema.parse(data);
        
        const existing = await prisma.user.findUnique({ where: { email: response.email } });
        if (existing) throw new Error('Email ya registrado');
        const role = await prisma.role.findUnique({ where: { code: response.role } });
        if (!role) throw new Error('Rol no válido');

        const hashedPassword = await hashPassword(data.password);
        const documentType = await prisma.documentType.findUnique({ where: { code: response.isBusiness ? 'RUC' : 'DNI' } });
  
        const user = await prisma.user.create({
                data: {
                    name: response.firstName + ' ' + response.lastName,
                    email: response.email,
                    emailVerified: true,
                    roleId: role.id,
                    isActive: true,
                    accounts: {
                        create: {
                            accountId: response.email,
                            providerId: 'credentials',
                            password: hashedPassword,
                        },
                    },
                    person: {
                        create: {
                            firstName: response.firstName,
                            lastName: response.lastName,
                            phone: response.phone,
                            address: response.address,
                            email: response.email,
                            typeBP: response.typeBP || 'natural',
                            typeDocId : documentType ? documentType.id : null,
                            documentNumber: response.documentNumber || "",
                        },
                    },
                },
                include: { role: true, person: true },
            });
        return { id: user.id, email: user.email };
    }

    async listUsers() {
        return prisma.user.findMany({
            include: {
                person: true,
                role: true,
            },
        });
    }
    async countUsers(filters: any) {
        return prisma.user.count({ where: filters });
    }
    async getUsers ( filters: any,skip: number, take: number) {
        // Construir filtros para campos relacionados (role, person)

        const users = await prisma.user.findMany({
            where: filters,
            skip,
            take,
            include: {
            role: true,
            person: true,
            },
        });
        return users
    }

    async activateUser(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        if (!user.emailVerified) {
            throw new Error('El usuario no ha verificado su correo electrónico');
        }
        return prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
        });
    }

    async deleteUser(userId: string) {
        await prisma.account.deleteMany({ where: { userId } });
        await prisma.bussinessPartner.deleteMany({ where: { userId } });
        await prisma.session.deleteMany({ where: { userId } });
        return prisma.user.delete({ where: { id: userId } });
    }

    async updateProfile(userId: string, data: any) {
        const response = updateMeSchema.parse(data);
        return prisma.bussinessPartner.update({
        where: { userId },
        data: {
            firstName: response.firstName,
            lastName: response.lastName,
            phone: response.phone,
            address: response.address,
        },
        });
    }

    async getProfile(userId: string) {
        return prisma.user.findUnique({
        where: { id: userId },
        include: { role: true, person: true },
        });
    }
    async unlockUser(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('Usuario no encontrado');
        //if (user.isActive) throw new Error('El usuario ya está activo');

        return prisma.user.update({
            where: { id: userId },
            data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
            },
        });
    }
    
    async getAllSessions(filters: any,skip: number, take: number) {
        return prisma.session.findMany({
            where: filters,
            skip,
            take,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        isActive: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async countSessions(filters: any) {
        return prisma.session.count({ where: filters });
    }

    async deleteSession(sessionId: string, requester: any) {
        const session = await prisma.session.findUnique({ where: { id: sessionId } });
        if (!session) throw new Error('Sesión no encontrada');
        // Prevent deletion of the current session
        if (session.id === requester) {
            throw new Error('No puedes eliminar tu propia sesión activa');
        }
        return prisma.session.delete({ where: { id: sessionId } });
    }   
    async deleteUserSessions( sessionId: string) {
        const allSessions = await prisma.session.findMany({
        });
        const sessionsToDelete = allSessions.filter((s) => s.id !== sessionId);
        return prisma.session.deleteMany({
            where: {
            id: { in: sessionsToDelete.map((s) => s.id) },
            },
        });
    }
    async logicalRemove(id: string) {
        return prisma.user.update({
            where: { id },
            data: { isDeleted: true,isActive: false },
        });
    }
    async verifyEmail(email: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('Usuario no encontrado');
        if (user.emailVerified) throw new Error('El correo ya está verificado');

        return prisma.user.update({
            where: { email },
            data: { emailVerified: true },
        });
    }
    async findById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { role: true, person: true },
        });
        if (!user) throw new Error('Usuario no encontrado');
        return user;
    }
}

export const userService = new UserService();
