import { randomBytes } from 'node:crypto'
import mongoose from 'mongoose'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { DealAgreement } from '../models/DealAgreement.js'

function orderNumber() {
  return `RET-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`
}

export async function createOrder(req, res, next) {
  const { productIds, delivery, clientRequestId, agreementId } = req.body || {}
  const negotiated = Boolean(agreementId)
  if ((!negotiated && (!Array.isArray(productIds) || !productIds.length || productIds.some((id) => !mongoose.isValidObjectId(id)))) || (negotiated && !mongoose.isValidObjectId(agreementId))) return res.status(400).json({ error: negotiated ? 'A valid agreementId is required' : 'productIds must contain valid product IDs' })
  if (!delivery || Object.values(delivery).some((value) => typeof value !== 'string' || !value.trim())) return res.status(400).json({ error: 'Complete delivery details are required' })
  try {
    if (clientRequestId) {
      const existingOrder = await Order.findOne({ buyer: req.user._id, clientRequestId })
      if (existingOrder) return res.json({ data: existingOrder, message: 'Order already created' })
    }
    if (negotiated) {
      const agreement = await DealAgreement.findOne({ _id: agreementId, buyer: req.user._id, status: 'ACTIVE', expiresAt: { $gt: new Date() } }).lean()
      if (!agreement) return res.status(409).json({ error: 'This deal agreement is expired or unavailable' })
      const product = await Product.findOneAndUpdate(
        { _id: agreement.product, status: 'available', seller: { $ne: req.user._id }, reservedBy: req.user._id, reservedAgreement: agreement._id, reservedUntil: { $gt: new Date() } },
        { $set: { status: 'sold', reservedUntil: null, reservedBy: null, reservedAgreement: null } },
        { new: true },
      ).lean()
      if (!product) return res.status(409).json({ error: 'This listing is no longer available for purchase' })
      const item = { product: product._id, seller: product.seller, title: product.title, image: product.imageUrl, price: agreement.agreedPrice }
      try {
        const order = await Order.create({ orderNumber: orderNumber(), buyer: req.user._id, clientRequestId, agreement: agreement._id, items: [item], subtotal: agreement.agreedPrice, delivery, status: 'placed', paymentStatus: 'not_collected' })
        await DealAgreement.updateOne({ _id: agreement._id, status: 'ACTIVE' }, { $set: { status: 'CHECKED_OUT' } })
        return res.status(201).json({ data: order, message: 'Demo negotiated pay-on-delivery order created' })
      } catch (error) {
        await Product.updateOne({ _id: product._id, status: 'sold' }, { $set: { status: 'available', reservedBy: req.user._id, reservedAgreement: agreement._id, reservedUntil: agreement.expiresAt } })
        throw error
      }
    }
    const uniqueIds = [...new Set(productIds)]
    const reserved = []
    for (const id of uniqueIds) {
      const product = await Product.findOneAndUpdate({ _id: id, status: 'available', seller: { $ne: req.user._id } }, { $set: { status: 'sold' } }, { new: true }).lean()
      if (!product) {
        for (const reservedProduct of reserved) await Product.updateOne({ _id: reservedProduct._id }, { $set: { status: 'available' } })
        return res.status(409).json({ error: 'One or more items are sold, unavailable, or belong to you' })
      }
      reserved.push(product)
    }
    const items = reserved.map((product) => ({ product: product._id, seller: product.seller, title: product.title, image: product.imageUrl, price: product.price }))
    const order = await Order.create({ orderNumber: orderNumber(), buyer: req.user._id, clientRequestId, items, subtotal: items.reduce((sum, item) => sum + item.price, 0), delivery, status: 'placed', paymentStatus: 'not_collected' })
    res.status(201).json({ data: order, message: 'Demo pay-on-delivery order created' })
  } catch (error) {
    next(error)
  }
}

export async function listOrders(req, res, next) {
  try {
    const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 }).lean()
    res.json({ data: orders })
  } catch (error) {
    next(error)
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id }).lean()
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json({ data: order })
  } catch (error) {
    next(error)
  }
}
