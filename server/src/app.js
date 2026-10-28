import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import productRoutes from './routes/productRoutes.js'
import authRoutes from './routes/authRoutes.js'
import accountRoutes from './routes/accountRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import negotiationRoutes from './routes/negotiationRoutes.js'
import { uploadDirectory } from './middleware/upload.js'

const app = express()
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || env.clientOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Origin is not allowed by CORS'))
  },
}))
app.use(express.json({ limit: '100kb' }))
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'retech-api', database: 'mongodb' }))
app.use('/api/auth', authRoutes)
app.use('/api/account', accountRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/negotiation', negotiationRoutes)
app.use('/uploads', express.static(uploadDirectory))
app.use('/api/products', productRoutes)
app.use(notFoundHandler)
app.use(errorHandler)

export default app
