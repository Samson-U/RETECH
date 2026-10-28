import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT) || 5000,
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map((origin) => origin.trim()),
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  publicApiOrigin: process.env.PUBLIC_API_ORIGIN || `http://localhost:${Number(process.env.PORT) || 5000}`,
  offerExpiryHours: Number(process.env.OFFER_EXPIRY_HOURS) || 48,
  dealReservationMinutes: Number(process.env.DEAL_RESERVATION_MINUTES) || 30,
}
