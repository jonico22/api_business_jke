import { Router } from 'express'
import * as reasonController from './reasonForRejection.controller'

const router = Router()

router.post('/', reasonController.create)
router.get('/', reasonController.findAll)
router.get('/:id', reasonController.findById)
router.put('/:id', reasonController.update)
router.delete('/:id', reasonController.remove)

export default router