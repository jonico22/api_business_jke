import { Router } from 'express';
import { getAllSessions, deleteSession } from '../controllers/session.controller';
import auth from '../middlewares/auth.middleware';

const router = Router();

router.use(auth);

router.get('/sessions', getAllSessions);
router.delete('/sessions/:id', deleteSession);

export default router;
