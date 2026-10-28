export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl })
}

export function errorHandler(error, req, res, next) {
  console.error(error)
  if (res.headersSent) return next(error)
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON request body' })
  if (error instanceof Error && error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Each image must be 5 MB or smaller' })
  if (error instanceof Error && error.message === 'Invalid file type') return res.status(400).json({ error: 'Only JPG, PNG, and WebP images are allowed' })
  if (error.name === 'ValidationError') return res.status(400).json({ error: 'Database validation failed', details: Object.values(error.errors).map((item) => item.message) })
  if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid database value' })
  if (error.code === 11000) return res.status(409).json({ error: 'A record with that value already exists' })
  res.status(error.status || 500).json({ error: error.status ? error.message : 'Internal server error' })
}
