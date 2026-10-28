import mongoose from 'mongoose'

const offerSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0.01 },
  offeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  state: { type: String, enum: ['PENDING', 'COUNTERED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'], default: 'PENDING', index: true },
  expiresAt: { type: Date, required: true, index: true },
  resolvedAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false })

offerSchema.index({ conversation: 1, createdAt: 1 })
offerSchema.index({ conversation: 1, state: 1 })

export const Offer = mongoose.model('Offer', offerSchema)
