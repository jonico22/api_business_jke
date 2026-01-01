import { Router } from "express";
import {
  createCurrency,
  getCurrencies,
  getCurrencyById,
  updateCurrency,
  deleteCurrency,
} from "./currency.controller";

const router = Router();

router.post("/", createCurrency);
router.get("/", getCurrencies);
router.get("/:id", getCurrencyById);
router.put("/:id", updateCurrency);
router.delete("/:id", deleteCurrency);

export default router;
