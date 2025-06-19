import { Router } from 'express';
import { getAllUsers, getProfile, updateProfile,createUser,deleteUserSessions,
    deleteUser,activateUser,unlockUser  } from '../controllers/user.controller';
import auth from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(auth);

// Listar y crear usuarios (admin y soporte)
router.get('/', allowRoles('admin', 'soporte'), getAllUsers);
router.post('/', allowRoles('admin', 'soporte'), createUser);

// Eliminar usuario (solo admin)
router.delete('/:id', allowRoles('admin'), deleteUser);
// Activar/desactivar usuarios (admin y soporte)
router.patch('/:id/activate', allowRoles('admin', 'soporte'), activateUser);

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.delete('/:id/sessions', deleteUserSessions);
router.patch('/:id/unlock', unlockUser);

export default router;
