import { Router } from 'express';
import isAuth from '@/middlewares/auth.middleware';
import { getFavorites, toggleFavorite } from './favorite.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(isAuth);

router.get('/', getFavorites);
router.post('/toggle', toggleFavorite);

export default router;
