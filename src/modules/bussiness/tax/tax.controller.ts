import { Request, Response } from 'express'
import * as TaxService from './tax.service'

export const getAll = async (_req: Request, res: Response) => {
  const data = await TaxService.getAllTaxes()
  res.json(data)
}

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params
  const tax = await TaxService.getTaxById(id)
  if (!tax) return res.status(404).json({ message: 'Tax not found' })
  res.json(tax)
}

export const create = async (req: Request, res: Response) => {
  try {
    const tax = await TaxService.createTax(req.body)
    res.status(201).json(tax)
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : error })
  }
}

export const update = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const tax = await TaxService.updateTax(id, req.body)
    res.json(tax)
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : error })
  }
}

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    await TaxService.deleteTax(id)
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : error })
  }
}
