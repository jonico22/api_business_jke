import { Router } from 'express'
import * as ReceiptTypeController from './receiptType.controller'

const router = Router()

router.get('/', ReceiptTypeController.getAll)
router.get('/:id', ReceiptTypeController.getById)
router.post('/', ReceiptTypeController.create)
router.put('/:id', ReceiptTypeController.update)
router.delete('/:id', ReceiptTypeController.remove)

export default router
