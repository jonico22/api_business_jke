// src/core/role/role.routes.ts
import { Router } from 'express';
import { createRole, getRoles, updateRole, deleteRole } from './role.controller';
import  auth  from '@/middlewares/auth.middleware';

const router = Router();

router.use(auth);

router.post('/', createRole);
router.get('/', getRoles);
router.put('/:id', updateRole);
// Eliminar rol (solo admin)
router.delete('/:id', deleteRole);

//falta anular rol  soporte,admin (delete logico)

export default router;
