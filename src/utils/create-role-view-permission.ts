import prisma from '../config/database';
import { logger } from './logger';

const data = [
    {
        role: 'admin',
        view: 'DASH',
        permission: 'read',
    },
    {
        role: 'admin',
        view: 'USER',
        permission: 'read',
    },
    {
        role: 'admin',
        view: 'USER_C',
        permission: 'create',
    },
    {
        role: 'admin',
        view: 'USER_E',
        permission: 'update',
    },
    {
        role: 'admin',
        view: 'USER',
        permission: 'delete',
    },
    {
        role: 'admin',
        view: 'USER',
        permission: 'soft_delete',
    },
    {
        role: 'admin',
        view: 'ROLE',
        permission: 'read',
    },
    {
        role: 'admin',
        view: 'ROLE_C',
        permission: 'create',
    },
    {
        role: 'admin',
        view: 'ROLE_E',
        permission: 'update',
    },
    {
        role: 'admin',
        view: 'ROLE',
        permission: 'delete',
    },
     {
        role: 'admin',
        view: 'ROLE',
        permission: 'soft_delete',
    },
]
export const createRoleViewPermission = async () => {
    for (const item of data) {
        const { role, view, permission } = item;

        const roleExists = await prisma.role.findUnique({ where: { name: role } });
        if (!roleExists) {
            logger.warn(`Rol no encontrado: ${role}`);
            continue;
        }

        const viewExists = await prisma.view.findUnique({ where: { code: view } });
        if (!viewExists) {
            logger.warn(`Vista no encontrada: ${view}`);
            continue;
        }

        const permissionExists = await prisma.permission.findUnique({ where: { name: permission } });
        if (!permissionExists) {
            logger.warn(`Permiso no encontrado: ${permission}`);
            continue;
        }

        const exists = await prisma.roleViewPermission.findFirst({
            where: {
                roleId: roleExists.id,
                viewId: viewExists.id,
                permissionId: permissionExists.id,
            },
        });

        if (!exists) {
            await prisma.roleViewPermission.create({
                data: {
                    roleId: roleExists.id,
                    viewId: viewExists.id,
                    permissionId: permissionExists.id,
                },
            });
            logger.info(`Permiso de rol y vista creado para ${role} en ${view} con permiso ${permission}`);
        }
    }
};