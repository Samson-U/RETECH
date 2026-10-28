import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
}, { timestamps: true, versionKey: false })

messageSchema.index({ conversation: 1, createdAt: 1 })

export const Message = mongoose.model('Message', messageSchema)
