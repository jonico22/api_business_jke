import { Router } from "express";
import { subscriptionMovementController } from "./subscriptionMovement.controller";

const router = Router();

router.post("/", subscriptionMovementController.create);
router.get("/", subscriptionMovementController.getAll);
router.get("/:id", subscriptionMovementController.getById);
router.put("/:id", subscriptionMovementController.update);
router.delete("/:id", subscriptionMovementController.delete);

export default router;
