// src/core/auth/auth.routes.ts
import { Router } from 'express';
import {
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  resetUserPassword,
  listSessions,
  deleteSession,
  logout
} from './auth.controller';
import auth from '@/middlewares/auth.middleware';
import { allowRoles } from '@/middlewares/role.middleware';

const router = Router();

router.post('/login', login);
router.post('/logout', auth, logout);
// enviar correo de restablecimiento de contraseña
router.post('/forgot-password', forgotPassword);
// restablecer contraseña con token
router.post('/reset-password', resetPassword);

// cambiar contraseña del usuario autenticado
router.post('/change-password', auth, changePassword);
// restablecer contraseña de un usuario por parte de un administrador
router.post('/reset-user-password/:userId',auth,allowRoles('admin', 'soporte'), resetUserPassword);

// Rutas protegidas POR REVISAR
router.get('/sessions', auth, listSessions);
router.delete('/sessions/:id', auth, deleteSession);

export default router;
