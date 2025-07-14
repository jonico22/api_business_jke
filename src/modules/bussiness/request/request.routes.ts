import { Router } from "express";
import {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
} from "./request.controller";

const router = Router();

router.post("/", createRequest);
router.get("/", getRequests);
router.get("/:id", getRequestById);
router.put("/:id", updateRequest);
router.delete("/:id", deleteRequest);

export default router;