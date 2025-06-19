import { Router } from 'express';
import { getAllRoles, createRole,updateRole, deleteRole } from '../controllers/role.controller';
import auth from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(auth);
// Proteger con middleware para admin o soporte
router.use(allowRoles('admin'));

router.get('/', getAllRoles);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router;
