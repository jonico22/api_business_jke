import { Router } from 'express';
import { forgotPassword, resetPassword,login } from '../core/user/auth.controller';

const router = Router();
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
