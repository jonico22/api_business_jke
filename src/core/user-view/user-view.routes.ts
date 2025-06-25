// src/core/user_view/user-view.routes.ts
import { Router } from 'express';
import {
  assignUserViewPermission,
  getAllUserViewPermissions,
  removeUserViewPermission,
  getUserViewPermissions
} from './user-view.controller';
import  auth  from '@/middlewares/auth.middleware';

const router = Router();

router.use(auth);

router.post('/', assignUserViewPermission);
router.get('/', getAllUserViewPermissions);
router.get('/:userId', getUserViewPermissions);
router.delete('/:id', removeUserViewPermission);

export default router;
