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
        if (!documentType) throw new Error('Tipo de documento no válido')
        const user = await prisma.user.create({
            data: {
                name: response.firstName + ' ' + response.lastName,
                email: response.email,
                emailVerified: true,
                roleId: role.id,
                isActive: true,
                mustChangePassword: response.role !== 'ADMIN',
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
                        typeBP: response.typeBP || 'PERSONA',
                        typeDocId: documentType ? documentType.id : null,
                        documentNumber: response.documentNumber || null,
                        sexo: response.sexo || null,
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
    async getUsers(filters: any, skip: number, take: number) {
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

        const bpData = {
            firstName: response.firstName,
            lastName: response.lastName,
            phone: response.phone,
            address: response.address,
            sexo: response.sexo,
        };

        const hasBpData = Object.values(bpData).some(val => val !== undefined);
        let updatedBP;

        if (hasBpData) {
            updatedBP = await prisma.bussinessPartner.update({
                where: { userId },
                data: bpData,
            });
        } else {
            updatedBP = await prisma.bussinessPartner.findUnique({ where: { userId } });
        }

        if (response.image !== undefined) {
            await prisma.user.update({
                where: { id: userId },
                data: { image: response.image }
            });
        }

        return updatedBP;
    }

    async getProfile(userId: string) {
        return prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: true,
                person: {
                    include: {
                        documentType: true,
                    },
                },
                sessions: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
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

    async getAllSessions(filters: any, skip: number, take: number) {
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
    async deleteUserSessions(sessionId: string) {
        const allSessions = await prisma.session.findMany({
        });
        const sessionsToDelete = allSessions.filter((s: { id: string; }) => s.id !== sessionId);
        return prisma.session.deleteMany({
            where: {
                id: { in: sessionsToDelete.map((s: { id: any; }) => s.id) },
            },
        });
    }
    async logicalRemove(id: string) {
        return prisma.user.update({
            where: { id },
            data: { isDeleted: true, isActive: false },
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

    /**
     * Asignar permisos especiales/aditivos a un Usuario
     * Reemplaza los permisos aditivos anteriores por los nuevos para la vista especificada
     */
    async assignPermissionsToUser(userId: string, viewCode: string, permissionNames: string[], assignerId: string | undefined) {
        // 1. Validar que la Vista y el Usuario existan
        const view = await prisma.view.findUnique({ where: { code: viewCode } });
        if (!view) throw new Error(`Vista ${viewCode} no encontrada`);

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error(`Usuario no encontrado`);

        // 2. Obtener IDs de los permisos permitidos
        const validPermissions = await prisma.permission.findMany({
            where: { name: { in: permissionNames } }
        });

        const validPermissionIds = validPermissions.map(p => p.id);

        // 3. Eliminar permisos anteriores de este Usuario para esta Vista
        await prisma.userViewPermission.deleteMany({
            where: { userId, viewId: view.id }
        });

        // 4. Crear los nuevos permisos aditivos
        if (validPermissionIds.length > 0) {
            const newPermissions = validPermissionIds.map(permissionId => ({
                userId,
                viewId: view.id,
                permissionId,
                createdBy: assignerId,
            }));

            await prisma.userViewPermission.createMany({
                data: newPermissions
            });
        }

        return { message: 'Permisos especiales del usuario actualizados correctamente' };
    }
}

export const userService = new UserService();
