// src/core/user/user.routes.ts
import { Router } from 'express';
import { createUser, activateUser, deleteUser, updateProfile,getProfile,deleteAllSessions,filterUsers,
    unlockUser,getAllSessions, deleteSessionUser } from './user.controller';
import  auth  from '@/middlewares/auth.middleware';
import { allowRoles } from '@/middlewares/role.middleware';

const router = Router();

router.get('/me',auth, getProfile);
router.put('/me',auth, updateProfile);

// Listar y crear usuarios (admin y soporte)
router.get('/', allowRoles('admin', 'soporte'), filterUsers);
router.post('/', allowRoles('admin', 'soporte'), createUser);

/*
router.post(
  '/',
  accessMiddleware({ view: 'USER_MANAGEMENT', action: 'CREATE' }),
  filterUsers
);*/

// Eliminar usuario (solo admin)
router.delete('/:id', allowRoles('admin'), deleteUser);

// falta anular usuario solo soporte,admin
// falta enviar email de confirmación de correo
// falta crear usuario de negocio de suscripción

// Listar sesiones de usuario (admin y soporte)
router.get('/sessions', allowRoles('admin', 'soporte'), getAllSessions);
// Eliminar sesión de usuario (admin y soporte)
router.delete('/sessions/:id', allowRoles('admin', 'soporte'), deleteSessionUser);
router.delete('/:id/sessions',allowRoles('admin', 'soporte'), deleteAllSessions);

// Activar/desactivar usuarios (admin y soporte)
router.patch('/:id/activate', allowRoles('admin', 'soporte'), activateUser);
router.patch('/:id/unlock',allowRoles('admin', 'soporte'), unlockUser);


export default router;
