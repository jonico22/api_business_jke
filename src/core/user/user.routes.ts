// src/core/user/user.routes.ts
import { Router } from 'express';
import { createUser, activateUser, deleteUser, updateProfile,getProfile,deleteAllSessions,filterUsers,
    unlockUser,getAllSessions, deleteSessionUser,logicalRemove,verifyEmail,getUserById  } from './user.controller';
import { allowRoles } from '@/middlewares/role.middleware';
import auth from '@/middlewares/auth.middleware';

const router = Router();

router.get('/verify-email', verifyEmail);
router.get('/me',auth, getProfile);
router.put('/me',auth, updateProfile);

// Listar y crear usuarios (admin y soporte)
router.get('/',auth ,allowRoles('ADMIN', 'SUPPORT'), filterUsers);
router.post('/',auth, allowRoles('ADMIN', 'SUPPORT'), createUser);

// Listar sesiones de usuario (admin y soporte)
router.get('/sessions', auth, allowRoles('ADMIN', 'SUPPORT'), getAllSessions);
// Eliminar sesión de usuario (admin y soporte)
router.delete('/sessions',auth, allowRoles('ADMIN', 'SUPPORT'), deleteAllSessions);
router.delete('/sessions/:id', auth, allowRoles('ADMIN', 'SUPPORT'), deleteSessionUser);
router.get('/logicalRemove/:id',auth, allowRoles('ADMIN'), logicalRemove);

/*
router.post(
  '/',
  accessMiddleware({ view: 'USER_MANAGEMENT', action: 'CREATE' }),
  filterUsers
);*/

// Eliminar usuario (solo admin)
router.delete('/:id',auth, allowRoles('ADMIN'), deleteUser);
router.get('/:id',auth, getUserById);

// Activar/desactivar usuarios (admin y soporte)
router.patch('/activate/:id',auth, allowRoles('ADMIN', 'SUPPORT'), activateUser);
router.patch('/unlock/:id',auth,allowRoles('ADMIN', 'SUPPORT'), unlockUser);


// falta crear usuario de negocio de suscripción
export default router;
