import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email must be valid'],
  },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
}, { timestamps: true, versionKey: false })

export const User = mongoose.model('User', userSchema)
