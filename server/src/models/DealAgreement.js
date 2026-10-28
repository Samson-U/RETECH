import mongoose from 'mongoose'

const dealAgreementSchema = new mongoose.Schema({
  agreementNumber: { type: String, required: true, unique: true, index: true },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  acceptedOffer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
  agreedPrice: { type: Number, required: true, min: 0.01 },
  expiresAt: { type: Date, required: true, index: true },
  status: { type: String, enum: ['ACTIVE', 'CHECKED_OUT', 'EXPIRED', 'CANCELLED'], default: 'ACTIVE', index: true },
}, { timestamps: true, versionKey: false })

dealAgreementSchema.index(
  { product: 1 },
  { unique: true, partialFilterExpression: { status: 'ACTIVE' } },
)

export const DealAgreement = mongoose.model('DealAgreement', dealAgreementSchema)
