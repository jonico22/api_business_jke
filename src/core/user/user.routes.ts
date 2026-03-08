// src/core/user/user.routes.ts
import { Router } from 'express';
import {
  createUser, activateUser, deleteUser, updateProfile, getProfile, deleteAllSessions, filterUsers,
  unlockUser, getAllSessions, deleteSessionUser, logicalRemove, verifyEmail, getUserById, assignUserPermissions,
  createBusinessUser, getBusinessUsers, toggleBusinessUserStatus, removeBusinessUser, updateBusinessUser
} from './user.controller';
import { allowRoles } from '@/middlewares/role.middleware';
import auth, { isRole } from '@/middlewares/auth.middleware';

const router = Router();

router.get('/verify-email', verifyEmail);
router.get('/me', auth, getProfile);
router.put('/me', auth, updateProfile);

// Listar y crear usuarios (admin y soporte)
router.get('/', auth, allowRoles('ADMIN', 'SUPPORT'), filterUsers);
router.post('/', auth, allowRoles('ADMIN', 'SUPPORT'), createUser);

// Listar sesiones de usuario (admin y soporte)
router.get('/sessions', auth, allowRoles('ADMIN', 'SUPPORT'), getAllSessions);
// Eliminar sesión de usuario (admin y soporte)
router.delete('/sessions', auth, allowRoles('ADMIN', 'SUPPORT'), deleteAllSessions);
router.delete('/sessions/:id', auth, allowRoles('ADMIN', 'SUPPORT'), deleteSessionUser);
router.get('/logicalRemove/:id', auth, allowRoles('ADMIN'), logicalRemove);

/*
router.post(
  '/',
  accessMiddleware({ view: 'USER_MANAGEMENT', action: 'CREATE' }),
  filterUsers
);*/

// ==========================================
// 1. RUTAS ESTÁTICAS Y DE NEGOCIO (Colocar siempre antes de /:id)
// ==========================================

// Crear usuario de negocio para la suscripción (solo OWNER o ADMIN locales)
router.post('/business', auth, isRole(['OWNER', 'BUSINESS_MANAGER', 'ADMIN']), createBusinessUser);

// Listar usuarios de negocio para la suscripción actual
router.get('/business', auth, isRole(['OWNER', 'BUSINESS_MANAGER', 'ADMIN']), getBusinessUsers);

// Activar/Desactivar usuarios de negocio (suspender empleado)
router.patch('/business/:id/toggle-status', auth, isRole(['OWNER', 'BUSINESS_MANAGER', 'ADMIN']), toggleBusinessUserStatus);

// Eliminar permanentemente a un usuario de negocio
router.delete('/business/:id', auth, isRole(['OWNER', 'BUSINESS_MANAGER', 'ADMIN']), removeBusinessUser);

// Editar datos básicos o rol de un empleado del negocio
router.put('/business/:id', auth, isRole(['OWNER', 'BUSINESS_MANAGER', 'ADMIN']), updateBusinessUser);

// ==========================================
// 2. RUTAS DINÁMICAS (/:id) Y DE ADMINISTRACIÓN GLOBAL
// ==========================================

// Eliminar usuario (solo admin)
router.delete('/:id', auth, allowRoles('ADMIN'), deleteUser);
router.get('/:id', auth, getUserById);

// Activar/desactivar usuarios (admin y soporte)
router.patch('/activate/:id', auth, allowRoles('ADMIN', 'SUPPORT'), activateUser);
router.patch('/unlock/:id', auth, allowRoles('ADMIN', 'SUPPORT'), unlockUser);

// Modificar permisos directos del usuario (solo OWNER o ADMIN)
router.post('/:id/permissions', auth, isRole(['ADMIN', 'OWNER']), assignUserPermissions);

export default router;
