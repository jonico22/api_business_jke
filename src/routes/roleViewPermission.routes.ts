import { Router } from 'express';
import {
  assignPermissionToRoleOnView,
  getAllRoleViewPermissions,
  removePermissionAssignment,
  getPermissionsByRole,
  checkRolePermission,
  removeAllRolePermissionsFromView,
  getViewsByRole,
} from '../controllers/roleViewPermission.controller';
import { allowRoles } from '../middlewares/role.middleware';
import auth from '../middlewares/auth.middleware';

const router = Router();

router.use(auth);

// Solo admin y soporte pueden administrar permisos
router.use(allowRoles('admin', 'soporte'));

// CRUD
router.get('/', getAllRoleViewPermissions);
router.post('/', assignPermissionToRoleOnView);
router.delete('/:id', removePermissionAssignment);

// Funcionalidades adicionales
router.get('/by-role/:roleId', getPermissionsByRole);
router.get('/check', checkRolePermission);
router.post('/clean-role-view', removeAllRolePermissionsFromView);
router.get('/views/:roleId', getViewsByRole);

export default router;

