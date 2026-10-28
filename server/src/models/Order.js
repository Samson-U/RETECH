import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  clientRequestId: { type: String, index: true },
  agreement: { type: mongoose.Schema.Types.ObjectId, ref: 'DealAgreement', default: null, index: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  }],
  subtotal: { type: Number, required: true, min: 0 },
  delivery: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
  },
  status: { type: String, enum: ['placed', 'cancelled'], default: 'placed' },
  paymentStatus: { type: String, enum: ['not_collected'], default: 'not_collected' },
}, { timestamps: true, versionKey: false })

orderSchema.index({ buyer: 1, clientRequestId: 1 }, { unique: true, sparse: true })

export const Order = mongoose.model('Order', orderSchema)
