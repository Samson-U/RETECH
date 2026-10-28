const categories = ['Computing', 'Mobiles', 'Audio', 'Gaming', 'Photography', 'Accessories']
const conditions = ['Excellent', 'Good', 'Fair']

function asString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function addError(errors, field, message) {
  errors.push({ field, message })
}

export function validateProduct(req, res, next) {
  const { name, title, category, price, condition, description, image, imageUrl, images, imageUrls, location, status } = req.body || {}
  const productTitle = asString(typeof title === 'string' ? title : name)
  const numericPrice = Number(price)
  const uploadedImages = (req.files || []).map((file) => `/uploads/${file.filename}`)
  const imageList = uploadedImages.length
    ? uploadedImages
    : Array.isArray(imageUrls)
      ? imageUrls
      : Array.isArray(images)
        ? images
        : []
  const productImage = asString(typeof imageUrl === 'string' ? imageUrl : typeof image === 'string' ? image : imageList[0])
  const errors = []

  if (!productTitle) addError(errors, 'title', 'Title is required')
  if (!categories.includes(category)) addError(errors, 'category', `Category must be one of: ${categories.join(', ')}`)
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) addError(errors, 'price', 'Price must be a positive number')
  if (!conditions.includes(condition)) addError(errors, 'condition', `Condition must be one of: ${conditions.join(', ')}`)
  if (!asString(description)) addError(errors, 'description', 'Description is required')
  if (!productImage) addError(errors, 'image', 'At least one product image is required')
  else if (!productImage.startsWith('/uploads/')) {
    try {
      const imageUrlValue = new URL(productImage)
      if (!['http:', 'https:'].includes(imageUrlValue.protocol)) addError(errors, 'image', 'Image URL must use http or https')
    } catch {
      addError(errors, 'image', 'Image URL must be a valid http(s) URL')
    }
  }
  if (!asString(location)) addError(errors, 'location', 'Location is required')
  if (status !== undefined && !['available', 'sold', 'archived'].includes(status)) addError(errors, 'status', 'Status must be available, sold, or archived')

  if (errors.length) {
    const firstError = errors[0]
    return res.status(400).json({
      error: 'Product validation failed',
      field: firstError.field,
      details: errors.map((item) => ({ field: item.field, message: item.message })),
    })
  }

  const validatedImages = [productImage, ...imageList.filter((value) => typeof value === 'string' && value.trim() && value.trim() !== productImage)]
  req.validatedProduct = {
    title: productTitle,
    category,
    price: numericPrice,
    condition,
    description: asString(description),
    imageUrl: productImage,
    imageUrls: validatedImages,
    location: asString(location),
    ...(status ? { status } : {}),
  }

  next()
}
