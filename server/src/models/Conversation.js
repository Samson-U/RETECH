import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN', index: true },
  lastMessageAt: { type: Date, default: null, index: true },
}, { timestamps: true, versionKey: false })

conversationSchema.index({ product: 1, buyer: 1, seller: 1 }, { unique: true })

export const Conversation = mongoose.model('Conversation', conversationSchema)
