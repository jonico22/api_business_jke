import { Request, Response } from 'express'
import * as reasonService from './reasonForRejection.service'
import { createReasonSchema } from './reasonForRejection.validation'

export const create = async (req: Request, res: Response) => {
  const parsed = createReasonSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json(parsed.error.format())

  const reason = await reasonService.createReason(parsed.data)
  return res.status(201).json(reason)
}

export const findAll = async (_: Request, res: Response) => {
  const reasons = await reasonService.getAllReasons()
  return res.json(reasons)
}

export const findById = async (req: Request, res: Response) => {
  const { id } = req.params
  const reason = await reasonService.getReasonById(id)
  if (!reason) return res.status(404).json({ message: 'Reason not found' })

  return res.json(reason)
}

export const update = async (req: Request, res: Response) => {
  const { id } = req.params
  const parsed = createReasonSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json(parsed.error.format())

  const reason = await reasonService.updateReason(id, parsed.data)
  return res.json(reason)
}

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params
  await reasonService.deleteReason(id)
  return res.status(204).send()
}
