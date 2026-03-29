// src/core/auth/auth.routes.ts
import { Router } from 'express';
import {
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  resetUserPassword,
  logout,
  getCurrentUser,
  refreshSession,
  resendVerificationEmail,
  archiveUser,
  getMyPermissions
} from './auth.controller';
import auth from '@/middlewares/auth.middleware';
import { allowRoles } from '@/middlewares/role.middleware';
import { validateTurnstile } from '@/middlewares/turnstile.middleware';


const router = Router();

router.post('/login', validateTurnstile, login);
router.post('/logout', auth, logout);
// enviar correo de restablecimiento de contraseña
router.post('/forgot-password', validateTurnstile, forgotPassword);
// restablecer contraseña con token
router.post('/reset-password', validateTurnstile, resetPassword);
router.post('/resend-verification-email', resendVerificationEmail);
// cambiar contraseña del usuario autenticado
router.post('/change-password', auth, changePassword);

router.post("/refresh-session", auth, refreshSession);
router.get("/me", auth, getCurrentUser);
router.get("/me/permissions", auth, getMyPermissions);
router.post('/archive-user/:userId', auth, allowRoles('admin', 'soporte'), archiveUser);
// restablecer contraseña de un usuario por parte de un administrador
router.post('/reset-user-password/:userId', auth, allowRoles('admin', 'soporte'), resetUserPassword);

export default router;
