import { Router } from 'express'
import {
  acceptOffer,
  counterOffer,
  createMessage,
  createOffer,
  createOrGetConversation,
  getAgreement,
  getConversation,
  listMessages,
  listConversations,
  rejectOffer,
} from '../controllers/negotiationController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)
router.get('/conversations', listConversations)
router.post('/conversations', createOrGetConversation)
router.get('/conversations/:conversationId', getConversation)
router.get('/conversations/:conversationId/messages', listMessages)
router.post('/conversations/:conversationId/messages', createMessage)
router.post('/conversations/:conversationId/offers', createOffer)
router.post('/offers/:offerId/counter', counterOffer)
router.post('/offers/:offerId/accept', acceptOffer)
router.post('/offers/:offerId/reject', rejectOffer)
router.get('/agreements/:agreementId', getAgreement)

export default router
