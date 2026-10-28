import app from './app.js'
import { connectDatabase } from './config/database.js'
import { env } from './config/env.js'
import { DealAgreement } from './models/DealAgreement.js'
import { Offer } from './models/Offer.js'
import { Product } from './models/Product.js'

async function releaseExpiredNegotiations() {
  const now = new Date()
  const expiredAgreements = await DealAgreement.find({ status: 'ACTIVE', expiresAt: { $lte: now } }).select('_id product').lean()
  if (expiredAgreements.length) {
    await DealAgreement.updateMany({ _id: { $in: expiredAgreements.map((agreement) => agreement._id) }, status: 'ACTIVE' }, { $set: { status: 'EXPIRED' } })
    await Product.updateMany({ reservedAgreement: { $in: expiredAgreements.map((agreement) => agreement._id) } }, { $set: { reservedUntil: null, reservedBy: null, reservedAgreement: null } })
  }
  await Offer.updateMany({ state: 'PENDING', expiresAt: { $lte: now } }, { $set: { state: 'EXPIRED', resolvedAt: now } })
}

try {
  if (!env.jwtSecret) throw new Error('JWT_SECRET is required. Add it to server/.env.')
  await connectDatabase()
  app.listen(env.port, () => {
    console.log(`ReTech API listening on http://localhost:${env.port}`)
    setInterval(() => releaseExpiredNegotiations().catch((error) => console.error(`Negotiation cleanup failed: ${error.message}`)), 60_000)
  })
} catch (error) {
  console.error(`Unable to start ReTech API: ${error.message}`)
  process.exitCode = 1
}
