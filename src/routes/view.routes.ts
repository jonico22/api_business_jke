import { Router } from 'express';
import {
  createView,
  getViews,
  updateView,
  deleteView,
} from '../controllers/view.controller';
import auth from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(auth);
router.use(allowRoles('admin', 'soporte'));

router.get('/', getViews);
router.post('/', createView);
router.put('/:id', updateView);
router.delete('/:id', deleteView);

export default router;
