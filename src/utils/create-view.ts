import prisma from '../config/database';
import { logger } from './logger';

const views = [
  { code: 'DASH',name: 'dashboard', description: 'Panel de control',path: '/dashboard' },
  { code:'USER', name: 'users', description: 'Usuarios', path: '/users' },
  { code:'USER_E', name: 'user edit', description: 'Editar Usuarios', path: '/users/create' },
  { code:'USER_C', name: 'user create', description: 'Crear Usuarios', path: '/users/edit' },
  { code: 'ROLE', name: 'roles', description: 'Roles' ,path: '/roles'},
  { code: 'ROLE_E', name: 'roles edit', description: 'Roles editar' ,path: '/roles/edit'},
  { code: 'ROLE_C', name: 'roles create', description: 'Roles crear' ,path: '/roles/create'},
  { code: 'PERM', name: 'permissions', description: 'Permisos',path: '/permissions' },
  { code: 'VIEW', name: 'views', description: 'vistas',path: '/views' },
  { code: 'VIEW_E', name: 'views edit', description: 'vistas editar',path: '/views/edit' },
  { code: 'VIEW_c', name: 'views create', description: 'vistas crear',path: '/views/create' },
];

export const createViews = async () => {
  for (const view of views) {
    const exists = await prisma.view.findUnique({ where: { code: view.code } });
    if (!exists) {
      await prisma.view.create({ data: { ...view, code: view.code } });
      logger.info(`Vista creada: ${view.name}`);
    }
  }
};

