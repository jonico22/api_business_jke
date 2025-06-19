import { Router } from 'express';
import {
  createPermission,
  getPermissions,
  updatePermission,
  deletePermission,
} from '../controllers/permission.controller';
import auth from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';
const router = Router();

router.use(auth);
router.use(allowRoles('admin'));
router.get('/', getPermissions);
router.post('/', createPermission);
router.put('/:id', updatePermission);
router.delete('/:id', deletePermission);

export default router;
