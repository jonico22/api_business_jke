import { Request, Response } from 'express'
import { orderPaymentService } from './orderPayment.service'

export const orderPaymentController = {
  create: async (req: Request, res: Response) => {
    try {
      const payment = await orderPaymentService.create(req.body)
      res.status(201).json(payment)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  },

  findAll: async (req: Request, res: Response) => {
    try {
      const filters = req.query
      const payments = await orderPaymentService.findAll(filters)
      res.json(payments)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  findById: async (req: Request, res: Response) => {
    try {
      const payment = await orderPaymentService.findById(req.params.id)
      if (!payment) return res.status(404).json({ error: 'Order payment not found' })
      res.json(payment)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const payment = await orderPaymentService.update(req.params.id, req.body)
      res.json(payment)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      await orderPaymentService.delete(req.params.id)
      res.status(204).send()
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },
}
