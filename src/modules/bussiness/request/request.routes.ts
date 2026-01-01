import { Router } from "express";
import {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  updateRequestStatusVerified
} from "./request.controller";

const router = Router();

router.post("/", createRequest);
router.get("/", getRequests);
router.get("/:id", getRequestById);
//router.put("/:id", updateRequest);
router.put("/:id", updateRequestStatusVerified); // Endpoint to update request status
router.delete("/:id", deleteRequest);

export default router;