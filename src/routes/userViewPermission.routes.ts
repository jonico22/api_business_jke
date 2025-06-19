import { Router } from 'express';
import {
  assignUserPermission,
  getUserPermissions,
  removeUserPermission,
} from '../controllers/userViewPermission.controller';

import auth from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(auth);
router.use(allowRoles('admin', 'soporte'));

router.get('/:userId', getUserPermissions);
router.post('/', assignUserPermission);
router.delete('/:id', removeUserPermission);

export default router;
