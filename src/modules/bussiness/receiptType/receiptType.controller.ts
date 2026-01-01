import { Request, Response } from 'express'
import * as ReceiptTypeService from './receiptType.service'

export const getAll = async (_req: Request, res: Response) => {
  const result = await ReceiptTypeService.getAllReceiptTypes()
  res.json(result)
}

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await ReceiptTypeService.getReceiptTypeById(id)
  if (!result) return res.status(404).json({ message: 'ReceiptType not found' })
  res.json(result)
}

export const create = async (req: Request, res: Response) => {
  try {
    const result = await ReceiptTypeService.createReceiptType(req.body)
    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : error })
  }
}

export const update = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const result = await ReceiptTypeService.updateReceiptType(id, req.body)
    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : error })
  }
}

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    await ReceiptTypeService.deleteReceiptType(id)
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : error })
  }
}
