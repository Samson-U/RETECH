import { Router } from 'express'
import { contactSeller, createProduct, deleteProduct, getProduct, listProducts, updateProduct } from '../controllers/productController.js'
import { validateProduct } from '../middleware/validateProduct.js'
import { requireAuth, requireSeller } from '../middleware/auth.js'
import { productUpload } from '../middleware/upload.js'

const router = Router()
router.get('/', listProducts)
router.get('/:id', getProduct)
router.get('/:id/contact', requireAuth, contactSeller)
router.post('/', requireAuth, requireSeller, productUpload.array('images', 8), validateProduct, createProduct)
router.put('/:id', requireAuth, requireSeller, validateProduct, updateProduct)
router.delete('/:id', requireAuth, requireSeller, deleteProduct)

export default router
