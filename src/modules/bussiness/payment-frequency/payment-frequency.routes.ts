import { Router } from "express";
import {
  createPaymentFrequency,
  getPaymentFrequencies,
  getPaymentFrequencyById,
  updatePaymentFrequency,
  deletePaymentFrequency,
} from "./payment-frequency.controller";

const router = Router();

router.post("/", createPaymentFrequency);
router.get("/", getPaymentFrequencies);
router.get("/:id", getPaymentFrequencyById);
router.put("/:id", updatePaymentFrequency);
router.delete("/:id", deletePaymentFrequency);

export default router;