import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'

function publicUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
}

function issueToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn })
}

function validateCredentials(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const errors = []
  if (name.length < 2 || name.length > 120) errors.push('name must be 2-120 characters')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email must be valid')
  if (password.length < 8 || password.length > 128) errors.push('password must be 8-128 characters')
  return { name, email, password, errors }
}

export async function register(req, res, next) {
  try {
    const { name, email, password, errors } = validateCredentials(req.body || {})
    if (errors.length) return res.status(400).json({ error: 'Invalid registration data', details: errors })
    const role = req.body.role === 'seller' ? 'seller' : 'buyer'
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: 'An account with that email already exists' })
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, passwordHash, role })
    res.status(201).json({ data: { user: publicUser(user), token: issueToken(user) }, message: 'Account created' })
  } catch (error) {
    next(error)
  }
}

export async function login(req, res, next) {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const password = typeof req.body?.password === 'string' ? req.body.password : ''
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
    const user = await User.findOne({ email }).select('+passwordHash')
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Email or password is incorrect' })
    res.json({ data: { user: publicUser(user), token: issueToken(user) }, message: 'Logged in' })
  } catch (error) {
    next(error)
  }
}

export function me(req, res) {
  res.json({ data: publicUser(req.user) })
}
