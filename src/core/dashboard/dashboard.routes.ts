import { Router } from "express";
import { getDashboardSummary } from "./dashboard.controller";
import auth from '@/middlewares/auth.middleware';

const router = Router();

router.get("/summary", auth, getDashboardSummary);

export default router;
