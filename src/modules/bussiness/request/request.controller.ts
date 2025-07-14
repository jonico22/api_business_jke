import { Request, Response } from "express";
import { requestService } from "./request.service";
import {
  createRequestSchema,
  updateRequestSchema,
} from "./request.validation";

export const createRequest = async (req: Request, res: Response) => {
  try {
    const data = createRequestSchema.parse(req.body);
    const result = await requestService.create(data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getRequests = async (req: Request, res: Response) => {
  try {
    const result = await requestService.findAll();
    res.json({ data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRequestById = async (req: Request, res: Response) => {
  try {
    const result = await requestService.findById(req.params.id);
    if (!result) return res.status(404).json({ message: "Not found" });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRequest = async (req: Request, res: Response) => {
  try {
    const data = updateRequestSchema.parse(req.body);
    const result = await requestService.update(req.params.id, data);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteRequest = async (req: Request, res: Response) => {
  try {
    await requestService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};