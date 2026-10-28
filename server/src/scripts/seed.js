import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'
import bcrypt from 'bcryptjs'
import { sampleProducts } from '../data/products.js'

const seedProducts = sampleProducts.map((sample) => {
  const product = { ...sample }
  delete product.id
  product.title = product.name
  product.imageUrl = product.image
  delete product.name
  delete product.image
  product.status = 'available'
  product.demoKey = sample.id
  return product
})

try {
  await connectDatabase()
  const passwordHash = await bcrypt.hash('sample-password-123', 12)
  const seller = await User.findOneAndUpdate(
    { email: 'sample.seller@retech.example' },
    { name: 'Sample Seller', email: 'sample.seller@retech.example', passwordHash, role: 'seller' },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  for (const product of seedProducts) {
    await Product.findOneAndUpdate(
      { seller: seller._id, $or: [{ demoKey: product.demoKey }, { title: product.title }] },
      { $set: { ...product, seller: seller._id } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, runValidators: true },
    )
  }
  console.log(`Upserted ${seedProducts.length} clearly labeled demo products without deleting existing listings.`)
} catch (error) {
  console.error('Seed failed:', error.message)
  process.exitCode = 1
} finally {
  await disconnectDatabase()
}
