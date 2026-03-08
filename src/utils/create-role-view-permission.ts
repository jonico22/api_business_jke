import prisma from '../config/database';
import { logger } from './logger';

const roleViewMapping = [
    {
        roleCode: 'OWNER',
        views: ['DASHBOARD', 'STOCK', 'SALES', 'USERS', 'REPORTS', 'SUBSCRIPTIONS', 'SETTINGS'],
    },
    {
        roleCode: 'BUSINESS_MANAGER',
        views: ['DASHBOARD', 'STOCK', 'SALES', 'USERS', 'REPORTS', 'SETTINGS'], // Sin Suscripción
    },
    {
        roleCode: 'SELLER',
        views: ['DASHBOARD', 'SALES', 'SETTINGS'],
    },
    {
        roleCode: 'STOCK_MANAGER',
        views: ['DASHBOARD', 'STOCK', 'SETTINGS'],
    },
    {
        roleCode: 'ADMIN',
        views: ['DASHBOARD', 'STOCK', 'SALES', 'USERS', 'REPORTS', 'SUBSCRIPTIONS', 'SETTINGS', 'ROLES'], // Acceso total general
    },
    {
        roleCode: 'SUPPORT',
        views: ['DASHBOARD', 'STOCK', 'SALES', 'USERS', 'REPORTS', 'SUBSCRIPTIONS', 'SETTINGS', 'ROLES'], // Soporte general
    }
];

export const createRoleViewPermission = async () => {
    // En tu frontend, el permiso maestro para MOSTRAR la vista en el menú es "read" 
    // Opcionalmente podemos iterar ["create", "read", "update", "delete"] si quieres darles poder total, 
    // pero para los menús bastará con asignar la base primero. Agregaremos todos los básicos:
    const allPermissions = await prisma.permission.findMany();

    if (allPermissions.length === 0) {
        logger.warn('No hay permisos en la BD. Ejecuta createPermissions primero.');
        return;
    }

    for (const mapping of roleViewMapping) {
        const role = await prisma.role.findUnique({ where: { code: mapping.roleCode } });
        if (!role) {
            logger.warn(`Rol no encontrado: ${mapping.roleCode}`);
            continue;
        }

        for (const viewCode of mapping.views) {
            const view = await prisma.view.findUnique({ where: { code: viewCode } });
            if (!view) {
                logger.warn(`Vista no encontrada: ${viewCode}`);
                continue;
            }

            // Asignar todos los permisos de la BD a esta vista para el ROL (Poder total en la vista)
            for (const permission of allPermissions) {
                const exists = await prisma.roleViewPermission.findFirst({
                    where: {
                        roleId: role.id,
                        viewId: view.id,
                        permissionId: permission.id,
                    },
                });

                if (!exists) {
                    await prisma.roleViewPermission.create({
                        data: {
                            roleId: role.id,
                            viewId: view.id,
                            permissionId: permission.id,
                        },
                    });
                    logger.info(`Permiso [${permission.name}] de vista [${viewCode}] concedido al rol [${mapping.roleCode}]`);
                }
            }
        }
    }
};