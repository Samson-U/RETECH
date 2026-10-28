import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { env } from '../config/env.js'
import { User } from '../models/User.js'

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token || !env.jwtSecret) return res.status(401).json({ error: 'Authentication required' })
  try {
    const payload = jwt.verify(token, env.jwtSecret)
    if (!mongoose.isValidObjectId(payload.sub)) return res.status(401).json({ error: 'Invalid authentication token' })
    const user = await User.findById(payload.sub).select('+passwordHash').lean()
    if (!user) return res.status(401).json({ error: 'User account not found' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired authentication token' })
  }
}

export function requireSeller(req, res, next) {
  if (!req.user || !['seller', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Seller access required' })
  next()
}
