import { Router } from 'express'
import { myListings } from '../controllers/accountController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.get('/listings', requireAuth, myListings)

export default router
