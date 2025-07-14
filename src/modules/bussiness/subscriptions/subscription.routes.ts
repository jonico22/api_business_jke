import { Router } from "express";
import * as subscriptionController from "./subscription.controller";
import  auth  from "@/middlewares/auth.middleware"; // middleware de sesión

const router = Router();

router.get("/", auth, subscriptionController.getSubscriptions);
router.get("/:id", auth, subscriptionController.getSubscriptionById);
router.post("/", auth, subscriptionController.createSubscription);
router.put("/:id", auth, subscriptionController.updateSubscription);
router.delete("/:id", auth, subscriptionController.deleteSubscription);

export default router;
