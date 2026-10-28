import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDatabase() {
  if (!env.mongodbUri) throw new Error('MONGODB_URI is required. Add it to server/.env.')
  mongoose.set('strictQuery', true)
  await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 5000 })
  console.log('Connected to MongoDB')
}

export async function disconnectDatabase() {
  await mongoose.disconnect()
}
