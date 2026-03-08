// src/core/role/role.routes.ts
import { Router } from 'express';
import { createRole, getRoles, updateRole, deleteRole, assignRolePermissions, getRolePermissions } from './role.controller';
import auth, { isRole } from '@/middlewares/auth.middleware';

const router = Router();

router.use(auth);

router.post('/', createRole);
router.get('/', getRoles);
router.put('/:id', updateRole);
// Eliminar rol (solo admin)
router.delete('/:id', deleteRole);

// Modificar permisos del rol (Solo ADMIN o OWNER pueden hacerlo)
router.post('/:id/permissions', isRole(['ADMIN', 'OWNER']), assignRolePermissions);

// Obtener permisos actuales de un rol agrupados por vista (Para UI)
router.get('/:id/permissions', isRole(['ADMIN', 'OWNER']), getRolePermissions);

//falta anular rol  soporte,admin (delete logico)

export default router;
