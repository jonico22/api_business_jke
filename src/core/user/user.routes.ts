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
router.get('/',auth ,allowRoles('admin', 'soporte'), filterUsers);
router.post('/',auth, allowRoles('admin', 'soporte'), createUser);

// Listar sesiones de usuario (admin y soporte)
router.get('/sessions', auth, allowRoles('admin', 'soporte'), getAllSessions);
// Eliminar sesión de usuario (admin y soporte)
router.delete('/sessions',auth, allowRoles('admin', 'soporte'), deleteAllSessions);
router.delete('/sessions/:id', auth, allowRoles('admin', 'soporte'), deleteSessionUser);
router.get('/logicalRemove/:id',auth, allowRoles('admin', 'soporte'), logicalRemove);

/*
router.post(
  '/',
  accessMiddleware({ view: 'USER_MANAGEMENT', action: 'CREATE' }),
  filterUsers
);*/

// Eliminar usuario (solo admin)
router.delete('/:id',auth, allowRoles('admin'), deleteUser);
router.get('/:id',auth, getUserById);




// Activar/desactivar usuarios (admin y soporte)
router.patch('/activate/:id',auth, allowRoles('admin', 'soporte'), activateUser);
router.patch('/unlock/:id',auth,allowRoles('admin', 'soporte'), unlockUser);


// falta crear usuario de negocio de suscripción
export default router;
