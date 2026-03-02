import { Router } from "express";
import * as subscriptionController from "./subscription.controller";
import auth from "@/middlewares/auth.middleware"; // middleware de sesión
import { upload } from "@/middlewares/upload.middleware";
const router = Router();

router.get("/", auth, subscriptionController.getSubscriptions);
router.get("/:id", auth, subscriptionController.getSubscriptionById);
router.post("/", auth, subscriptionController.createSubscription);
router.put("/:id", auth, subscriptionController.updateSubscription);
router.delete("/:id", auth, subscriptionController.deleteSubscription);

router.post("/:id/renew", auth, upload.single("file"), subscriptionController.renewSubscription);
router.post("/:id/upgrade", auth, subscriptionController.upgradeSubscription);
router.post("/:id/cancel", auth, subscriptionController.cancelSubscription);
router.post("/:id/reactivate", auth, subscriptionController.reactivateSubscription);
router.patch("/:id/auto-renew", auth, subscriptionController.toggleAutoRenewSubscription);

router.get("/:id/history", auth, subscriptionController.getHistory);
router.get("/:id/billing", auth, subscriptionController.getBilling);

export default router;
