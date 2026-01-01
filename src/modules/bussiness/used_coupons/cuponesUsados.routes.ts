import { Router } from 'express';
import { createCuponUsado, getCuponesUsados } from './usedCoupons.controller';
import auth from '@/middlewares/auth.middleware';

const router = Router();

router.post('/', auth, createCuponUsado);
router.get('/', auth, getCuponesUsados);

export default router;

