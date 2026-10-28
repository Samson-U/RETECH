import { randomBytes } from 'node:crypto'
import mongoose from 'mongoose'
import { Conversation } from '../models/Conversation.js'
import { DealAgreement } from '../models/DealAgreement.js'
import { Message } from '../models/Message.js'
import { Offer } from '../models/Offer.js'
import { Product } from '../models/Product.js'
import { env } from '../config/env.js'

const messageAttempts = new Map()

function id(value) {
  if (!value) return ''
  return (value._id || value).toString()
}

function agreementNumber() {
  return `DEAL-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`
}

function validId(req, res, name = 'id') {
  if (mongoose.isValidObjectId(req.params[name])) return true
  res.status(400).json({ error: `Invalid ${name}` })
  return false
}

function isMember(conversation, userId) {
  return [conversation.buyer, conversation.seller].some((member) => id(member) === id(userId))
}

function publicProduct(product) {
  if (!product || typeof product !== 'object') return product
  const images = product.imageUrls?.length ? product.imageUrls : [product.imageUrl]
  const publicImages = images.filter(Boolean).map((image) => image.startsWith('/uploads/') ? `${env.publicApiOrigin}${image}` : image)
  return { ...product, image: publicImages[0], images: publicImages }
}

function expireIfNeeded(agreement) {
  return agreement && agreement.status === 'ACTIVE' && agreement.expiresAt <= new Date()
}

async function releaseAgreement(agreement) {
  if (!agreement || agreement.status !== 'ACTIVE' || agreement.expiresAt > new Date()) return agreement
  const updated = await DealAgreement.findOneAndUpdate(
    { _id: agreement._id, status: 'ACTIVE', expiresAt: { $lte: new Date() } },
    { $set: { status: 'EXPIRED' } },
    { new: true },
  )
  await Product.updateOne(
    { _id: agreement.product, reservedAgreement: agreement._id },
    { $set: { reservedUntil: null, reservedBy: null, reservedAgreement: null } },
  )
  return updated || agreement
}

async function getConversationForUser(conversationId, userId) {
  const conversation = await Conversation.findById(conversationId)
    .populate('product', 'title price imageUrl imageUrls status seller')
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .lean()
  if (!conversation || !isMember(conversation, userId)) return null
  return conversation
}

async function serializeConversation(conversation, userId) {
  const messages = await Message.find({ conversation: conversation._id })
    .populate('sender', 'name')
    .sort({ createdAt: 1 })
    .lean()
  const offers = await Offer.find({ conversation: conversation._id })
    .populate('offeredBy', 'name')
    .sort({ createdAt: 1 })
    .lean()
  let agreement = await DealAgreement.findOne({ conversation: conversation._id }).sort({ createdAt: -1 }).lean()
  if (expireIfNeeded(agreement)) agreement = await releaseAgreement(agreement)
  return {
    conversation: { ...conversation, product: publicProduct(conversation.product) },
    messages,
    offers,
    agreement,
    currentUserId: id(userId),
  }
}

export async function createOrGetConversation(req, res, next) {
  const { productId } = req.body || {}
  if (!mongoose.isValidObjectId(productId)) return res.status(400).json({ error: 'A valid productId is required' })
  try {
    const product = await Product.findById(productId).lean()
    if (!product) return res.status(404).json({ error: 'Product not found' })
    if (!product.seller || id(product.seller) === id(req.user._id)) return res.status(403).json({ error: 'You cannot negotiate with yourself' })
    if (product.status !== 'available') return res.status(409).json({ error: 'This listing is no longer available for negotiation' })
    const conversation = await Conversation.findOneAndUpdate(
      { product: product._id, buyer: req.user._id, seller: product.seller },
      { $setOnInsert: { product: product._id, buyer: req.user._id, seller: product.seller } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
    const populatedConversation = await getConversationForUser(conversation._id, req.user._id)
    res.status(201).json({ data: await serializeConversation(populatedConversation, req.user._id) })
  } catch (error) {
    next(error)
  }
}

export async function listConversations(req, res, next) {
  try {
    const conversations = await Conversation.find({ $or: [{ buyer: req.user._id }, { seller: req.user._id }] })
      .populate('product', 'title price imageUrl status')
      .populate('buyer seller', 'name')
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean()
    res.json({ data: conversations })
  } catch (error) {
    next(error)
  }
}

export async function getConversation(req, res, next) {
  if (!validId(req, res, 'conversationId')) return
  try {
    const conversation = await getConversationForUser(req.params.conversationId, req.user._id)
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' })
    res.json({ data: await serializeConversation(conversation, req.user._id) })
  } catch (error) {
    next(error)
  }
}

export async function createMessage(req, res, next) {
  if (!validId(req, res, 'conversationId')) return
  const body = typeof req.body?.body === 'string' ? req.body.body.trim() : ''
  if (!body || body.length > 1000) return res.status(400).json({ error: 'Message must contain 1 to 1000 characters' })
  const key = `${req.user._id}:${req.params.conversationId}`
  const now = Date.now()
  const recent = (messageAttempts.get(key) || []).filter((timestamp) => now - timestamp < 60_000)
  if (recent.length >= 30) return res.status(429).json({ error: 'Message rate limit reached. Try again shortly.' })
  recent.push(now)
  messageAttempts.set(key, recent)
  try {
    const conversation = await getConversationForUser(req.params.conversationId, req.user._id)
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' })
    if (conversation.status !== 'OPEN') return res.status(409).json({ error: 'This conversation is closed' })
    const message = await Message.create({ conversation: conversation._id, sender: req.user._id, body })
    await Conversation.updateOne({ _id: conversation._id }, { $set: { lastMessageAt: message.createdAt } })
    res.status(201).json({ data: await message.populate('sender', 'name') })
  } catch (error) {
    next(error)
  }
}

export async function listMessages(req, res, next) {
  if (!validId(req, res, 'conversationId')) return
  try {
    const conversation = await getConversationForUser(req.params.conversationId, req.user._id)
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' })
    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'name')
      .sort({ createdAt: 1 })
      .lean()
    res.json({ data: messages })
  } catch (error) {
    next(error)
  }
}

async function getOfferContext(offerId, userId) {
  const offer = await Offer.findById(offerId).populate('conversation').lean()
  if (!offer || !offer.conversation || !isMember(offer.conversation, userId)) return null
  return offer
}

async function createAgreement(offer) {
  const now = new Date()
  const activeAgreement = await DealAgreement.findOne({ product: offer.product, status: 'ACTIVE' })
  if (activeAgreement) {
    const released = await releaseAgreement(activeAgreement)
    if (released?.status === 'ACTIVE') return { error: 'This item already has an active agreement' }
  }
  const expiresAt = new Date(now.getTime() + env.dealReservationMinutes * 60_000)
  const product = await Product.findOneAndUpdate(
    {
      _id: offer.product,
      status: 'available',
      seller: offer.seller,
      $or: [{ reservedUntil: null }, { reservedUntil: { $exists: false } }, { reservedUntil: { $lte: now } }],
    },
    { $set: { reservedUntil: expiresAt, reservedBy: offer.buyer } },
    { new: true },
  )
  if (!product) return { error: 'This listing is no longer available' }
  try {
    const agreement = await DealAgreement.create({
      agreementNumber: agreementNumber(),
      conversation: offer.conversation,
      product: offer.product,
      buyer: offer.buyer,
      seller: offer.seller,
      acceptedOffer: offer._id,
      agreedPrice: offer.amount,
      expiresAt,
      status: 'ACTIVE',
    })
    await Product.updateOne({ _id: product._id, reservedBy: offer.buyer, reservedAgreement: null }, { $set: { reservedAgreement: agreement._id } })
    return { agreement }
  } catch (error) {
    await Product.updateOne({ _id: product._id, reservedBy: offer.buyer, reservedAgreement: null }, { $set: { reservedUntil: null, reservedBy: null } })
    if (error.code === 11000) return { error: 'This listing was just reserved by another agreement' }
    throw error
  }
}

export async function createOffer(req, res, next) {
  if (!validId(req, res, 'conversationId')) return
  const amount = Number(req.body?.amount)
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Offer amount must be positive' })
  try {
    const conversation = await getConversationForUser(req.params.conversationId, req.user._id)
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' })
    if (id(conversation.buyer) !== id(req.user._id)) return res.status(403).json({ error: 'Only the buyer can submit an offer' })
    const product = await Product.findById(conversation.product._id || conversation.product).lean()
    if (!product || product.status !== 'available') return res.status(409).json({ error: 'This listing is no longer available' })
    const activeAgreement = await DealAgreement.findOne({ conversation: conversation._id, status: 'ACTIVE' })
    if (activeAgreement && (await releaseAgreement(activeAgreement)).status === 'ACTIVE') return res.status(409).json({ error: 'An active agreement already exists' })
    const pending = await Offer.findOne({ conversation: conversation._id, state: 'PENDING' })
    if (pending) return res.status(409).json({ error: 'Resolve the current offer before submitting another' })
    const offer = await Offer.create({
      conversation: conversation._id,
      product: product._id,
      buyer: conversation.buyer,
      seller: conversation.seller,
      amount,
      offeredBy: req.user._id,
      expiresAt: new Date(Date.now() + env.offerExpiryHours * 3_600_000),
    })
    res.status(201).json({ data: offer })
  } catch (error) {
    next(error)
  }
}

async function resolveOffer(req, res, action) {
  if (!validId(req, res, 'offerId')) return
  const offer = await getOfferContext(req.params.offerId, req.user._id)
  if (!offer) return res.status(404).json({ error: 'Offer not found' })
  if (offer.state !== 'PENDING' || offer.expiresAt <= new Date()) {
    if (offer.state === 'PENDING' && offer.expiresAt <= new Date()) await Offer.updateOne({ _id: offer._id, state: 'PENDING' }, { $set: { state: 'EXPIRED', resolvedAt: new Date() } })
    return res.status(409).json({ error: 'This offer is no longer pending' })
  }
  const isBuyerOffer = id(offer.offeredBy) === id(offer.buyer)
  const isBuyer = id(req.user._id) === id(offer.buyer)
  const isSeller = id(req.user._id) === id(offer.seller)
  if (action === 'counter') {
    const amount = Number(req.body?.amount)
    if (!((isSeller && isBuyerOffer) || (isBuyer && !isBuyerOffer))) return res.status(403).json({ error: 'Only the offer recipient can counter' })
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Counteroffer amount must be positive' })
    const updated = await Offer.findOneAndUpdate({ _id: offer._id, state: 'PENDING' }, { $set: { state: 'COUNTERED', resolvedAt: new Date() } }, { new: true })
    if (!updated) return res.status(409).json({ error: 'This offer was already resolved' })
    const counter = await Offer.create({ conversation: offer.conversation, product: offer.product, buyer: offer.buyer, seller: offer.seller, amount, offeredBy: req.user._id, expiresAt: new Date(Date.now() + env.offerExpiryHours * 3_600_000) })
    return { data: counter }
  }
  if ((action === 'reject' && !((isBuyer && !isBuyerOffer) || (isSeller && isBuyerOffer))) || (action === 'accept' && !((isBuyer && !isBuyerOffer) || (isSeller && isBuyerOffer)))) return res.status(403).json({ error: 'You cannot resolve this offer' })
  const updated = await Offer.findOneAndUpdate({ _id: offer._id, state: 'PENDING', expiresAt: { $gt: new Date() } }, { $set: { state: 'ACCEPTED', resolvedAt: new Date() } }, { new: true })
  if (!updated) return res.status(409).json({ error: 'This offer was already resolved' })
  if (action === 'reject') return { data: updated }
  const result = await createAgreement(updated)
  if (result.error) {
    await Offer.updateOne({ _id: updated._id }, { $set: { state: 'CANCELLED', resolvedAt: new Date() } })
    return res.status(409).json({ error: result.error })
  }
  return { data: result.agreement }
}

export async function counterOffer(req, res, next) {
  try {
    const result = await resolveOffer(req, res, 'counter')
    if (result) res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

export async function acceptOffer(req, res, next) {
  try {
    const result = await resolveOffer(req, res, 'accept')
    if (result) res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function rejectOffer(req, res, next) {
  try {
    const result = await resolveOffer(req, res, 'reject')
    if (result) res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function getAgreement(req, res, next) {
  if (!validId(req, res, 'agreementId')) return
  try {
    const agreement = await DealAgreement.findById(req.params.agreementId).populate('product', 'title price imageUrl status').lean()
    if (!agreement || ![id(agreement.buyer), id(agreement.seller)].includes(id(req.user._id))) return res.status(404).json({ error: 'Agreement not found' })
    const current = expireIfNeeded(agreement) ? await releaseAgreement(agreement) : agreement
    res.json({ data: current })
  } catch (error) {
    next(error)
  }
}
