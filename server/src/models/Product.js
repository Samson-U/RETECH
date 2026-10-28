import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  category: { type: String, required: true, enum: ['Computing', 'Mobiles', 'Audio', 'Gaming', 'Photography', 'Accessories'], index: true },
  price: { type: Number, required: true, min: [0.01, 'Price must be positive'], index: true },
  condition: { type: String, required: true, enum: ['Excellent', 'Good', 'Fair'], index: true },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
  imageUrl: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (value) => {
        try {
          return value.startsWith('/uploads/') || ['http:', 'https:'].includes(new URL(value).protocol)
        } catch {
          return false
        }
      },
      message: 'Image URL must use http or https',
    },
  },
  imageUrls: { type: [String], default: [] },
  location: { type: String, required: true, trim: true, maxlength: 120 },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['available', 'sold', 'archived'], default: 'available', index: true },
  demoKey: { type: String, default: null, index: true },
  reservedUntil: { type: Date, default: null, index: true },
  reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reservedAgreement: { type: mongoose.Schema.Types.ObjectId, ref: 'DealAgreement', default: null },
}, { timestamps: true, versionKey: false })

productSchema.index({ title: 'text', description: 'text' })

export const Product = mongoose.model('Product', productSchema)
