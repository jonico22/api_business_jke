// src/core/permission/permission.routes.ts
import { Router } from 'express';
import {
  createPermission,
  getPermissions,
  updatePermission,
  deletePermission,
} from './permission.controller';
import auth from '@/middlewares/auth.middleware';

const router = Router();

router.use(auth);

router.post('/', createPermission);
router.get('/', getPermissions);
router.put('/:id', updatePermission);
// Eliminar permiso (solo admin)
router.delete('/:id', deletePermission);

//falta anular rol  soporte,admin (delete logico)
export default router;