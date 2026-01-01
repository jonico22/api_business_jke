import { Router } from 'express';
import {
  addAuthorizedUser,
  getAuthorizedUsers,
  removeAuthorizedUser,
} from './authorizedUserSubscription.controller';

const router = Router();

router.get('/', getAuthorizedUsers);
router.post('/', addAuthorizedUser);
router.delete('/:id', removeAuthorizedUser);

export default router;