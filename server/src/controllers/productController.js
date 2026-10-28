import mongoose from 'mongoose'
import { Product } from '../models/Product.js'
import { env } from '../config/env.js'

function serializeProduct(product) {
  const item = product.toObject ? product.toObject() : product
  const images = item.imageUrls?.length ? item.imageUrls : [item.imageUrl]
  const publicImages = images.map((image) => image.startsWith('/uploads/') ? `${env.publicApiOrigin}${image}` : image)
  const { reservedUntil, reservedBy: _reservedBy, reservedAgreement: _reservedAgreement, ...publicItem } = item
  return { ...publicItem, dealLocked: Boolean(reservedUntil && new Date(reservedUntil) > new Date()), id: item._id.toString(), name: item.title, image: publicImages[0], images: publicImages }
}

function validateId(req, res) {
  if (mongoose.isValidObjectId(req.params.id)) return true
  res.status(400).json({ error: 'Invalid product ID' })
  return false
}

export async function listProducts(req, res, next) {
  try {
    const products = await Product.find().populate('seller', 'name').sort({ createdAt: -1 }).lean()
    res.json({ data: products.map(serializeProduct) })
  } catch (error) {
    next(error)
  }
}

export async function getProduct(req, res, next) {
  if (!validateId(req, res)) return
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name').lean()
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json({ data: serializeProduct(product) })
  } catch (error) {
    next(error)
  }
}

export async function contactSeller(req, res, next) {
    if (!validateId(req, res)) return
    try {
      const product = await Product.findById(req.params.id).populate('seller', 'name email').lean()
      if (!product) return res.status(404).json({ error: 'Product not found' })
      if (!product.seller || product.seller._id.toString() === req.user._id.toString()) return res.status(400).json({ error: 'Seller contact is unavailable for this listing' })
      res.json({ data: { sellerName: product.seller.name, email: product.seller.email, productId: product._id.toString() } })
    } catch (error) {
      next(error)
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await Product.create({ ...req.validatedProduct, seller: req.user._id })
    res.status(201).json({ data: serializeProduct(product), message: 'Product created' })
  } catch (error) {
    next(error)
  }
}

export async function updateProduct(req, res, next) {
  if (!validateId(req, res)) return
  try {
    const existing = await Product.findById(req.params.id)
    if (!existing) return res.status(404).json({ error: 'Product not found' })
    if (!existing.seller || (existing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin')) return res.status(403).json({ error: 'You can only modify your own listings' })
    const product = await Product.findByIdAndUpdate(req.params.id, req.validatedProduct, { new: true, runValidators: true })
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json({ data: serializeProduct(product), message: 'Product updated' })
  } catch (error) {
    next(error)
  }
}

export async function deleteProduct(req, res, next) {
  if (!validateId(req, res)) return
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    if (!product.seller || (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin')) return res.status(403).json({ error: 'You can only delete your own listings' })
    await product.deleteOne()
    res.json({ data: serializeProduct(product), message: 'Product deleted' })
  } catch (error) {
    next(error)
  }
}
