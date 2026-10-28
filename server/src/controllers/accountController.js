import { Product } from '../models/Product.js'

function serializeProduct(product) {
  const item = product.toObject ? product.toObject() : product
  return { ...item, id: item._id.toString(), name: item.title, image: item.imageUrl }
}

export async function myListings(req, res, next) {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 }).lean()
    res.json({ data: products.map(serializeProduct) })
  } catch (error) {
    next(error)
  }
}
