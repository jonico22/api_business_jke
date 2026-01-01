import { Router } from "express";
import * as receiptController from "./receipt.controller";
import auth from "@/middlewares/auth.middleware";

const router = Router();

router.use(auth); // todas requieren autenticación


router.post("/", receiptController.create);
router.get("/", receiptController.findAll);
router.get("/:id", receiptController.findOne);
router.put("/:id", receiptController.update);
router.delete("/:id", receiptController.remove);

router.post("/generate-pdf/:id", receiptController.generatePdfAndAttach);
router.get("/preview/:id", receiptController.previewReceipt);
export default router;
