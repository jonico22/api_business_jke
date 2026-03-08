import prisma from '../config/database';
import { logger } from './logger';

const permissions = [
  { name: 'create', description: 'Crear' },
  { name: 'read', description: 'Ver' },
  { name: 'update', description: 'Actualizar' },
  { name: 'delete', description: 'Eliminar' },
  { name: 'soft_delete', description: 'Eliminado logico' },
  { name: 'export', description: 'Exportar datos' },
];

const views = [
  { code: 'DASHBOARD', name: 'Dashboard', description: 'Vista principal de indicadores' },
  { code: 'USERS', name: 'Gestión de Usuarios', description: 'Vista para administrar usuarios' },
  { code: 'ROLES', name: 'Gestión de Roles', description: 'Vista para configurar roles y accesos' },
  { code: 'SALES', name: 'Ventas y POS', description: 'Vista del Punto de Venta' },
  { code: 'STOCK', name: 'Inventario', description: 'Vista para control de almacén' },
  { code: 'REPORTS', name: 'Reportes Financieros', description: 'Vista para métricas del negocio' },
  { code: 'SUBSCRIPTIONS', name: 'Suscripciones', description: 'Vista de planes y facturación' },
  { code: 'SETTINGS', name: 'Configuración', description: 'Vista para ajustes generales' },
];

export const createPermissions = async () => {
  // Crear Vistas
  for (const view of views) {
    const exists = await prisma.view.findUnique({ where: { code: view.code } });
    if (!exists) {
      await prisma.view.create({ data: view });
      logger.info(`Vista creada: ${view.code}`);
    }
  }

  // Crear Permisos
  for (const perm of permissions) {
    const exists = await prisma.permission.findUnique({ where: { name: perm.name } });
    if (!exists) {
      await prisma.permission.create({ data: perm });
      logger.info(`Permiso creado: ${perm.name}`);
    }
  }
};
