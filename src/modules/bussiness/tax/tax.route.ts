import { Router } from 'express'
import * as TaxController from './tax.controller'

const router = Router()

router.get('/', TaxController.getAll)
router.get('/:id', TaxController.getById)
router.post('/', TaxController.create)
router.put('/:id', TaxController.update)
router.delete('/:id', TaxController.remove)

export default router
