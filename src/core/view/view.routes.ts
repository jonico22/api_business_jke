// src/core/view/view.routes.ts
import { Router } from 'express';
import {
  createView,
  getViews,
  updateView,
  deleteView,
} from './view.controller';
import  auth  from '@/middlewares/auth.middleware';

const router = Router();

router.use(auth);

router.post('/', createView);
router.get('/', getViews);
router.put('/:id', updateView);
// Eliminar vista (solo admin)
router.delete('/:id', deleteView);

//falta anular rol  soporte,admin (delete logico)
export default router;
