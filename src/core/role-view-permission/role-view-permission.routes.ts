// src/core/role_view_permission/role-view-permission.routes.ts
import { Router } from 'express';
import {
  assignRoleViewPermission,
  getRoleViewPermissions,
  removeRoleViewPermission,
  getPermissionsByRole,
  checkRolePermission,
  removeAllRolePermissionsFromView,
  getViewsByRole,
} from './role-view-permission.controller';
import auth from '@/middlewares/auth.middleware';
import { allowRoles } from '@/middlewares/role.middleware';
const router = Router();

router.use(auth);
// Solo admin y soporte pueden administrar permisos
router.use(allowRoles('admin', 'soporte'));

// CRUD
router.get('/', getRoleViewPermissions);
router.post('/', assignRoleViewPermission);
router.delete('/:id', removeRoleViewPermission);

// Funcionalidades adicionales
router.get('/by-role/:roleId', getPermissionsByRole);
router.get('/check', checkRolePermission);
router.post('/clean-role-view', removeAllRolePermissionsFromView);
router.get('/views/:roleId', getViewsByRole);

export default router;