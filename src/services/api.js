const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
let authToken = window.localStorage.getItem('retech-auth-token')

export function setAuthToken(token) {
  authToken = token
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}), ...options.headers },
      ...options,
    })
  } catch {
    throw new Error('The ReTech API is unavailable. Start the backend and try again.')
  }

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detailMessage = Array.isArray(body.details) && body.details[0]?.message
      ? body.details[0].message
      : body.error || 'The request could not be completed.'
    const error = new Error(detailMessage)
    error.field = body.field || ''
    error.details = body.details || []
    throw error
  }
  return body.data
}

export const productApi = {
  list: () => request('/products'),
  get: (id) => request(`/products/${encodeURIComponent(id)}`),
  contact: (id) => request(`/products/${encodeURIComponent(id)}/contact`),
  create: (product) => request('/products', { method: 'POST', body: product instanceof FormData ? product : JSON.stringify(product) }),
  update: (id, product) => request(`/products/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(product) }),
  remove: (id) => request(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}

export const authApi = {
  register: (credentials) => request('/auth/register', { method: 'POST', body: JSON.stringify(credentials) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  me: () => request('/auth/me'),
  listings: () => request('/account/listings'),
}

export const orderApi = {
  create: (order) => request('/orders', { method: 'POST', body: JSON.stringify(order) }),
  list: () => request('/orders'),
  get: (id) => request(`/orders/${encodeURIComponent(id)}`),
}

export const negotiationApi = {
  conversations: () => request('/negotiation/conversations'),
  start: (productId) => request('/negotiation/conversations', { method: 'POST', body: JSON.stringify({ productId }) }),
  get: (id) => request(`/negotiation/conversations/${encodeURIComponent(id)}`),
  message: (id, body) => request(`/negotiation/conversations/${encodeURIComponent(id)}/messages`, { method: 'POST', body: JSON.stringify({ body }) }),
  offer: (id, amount) => request(`/negotiation/conversations/${encodeURIComponent(id)}/offers`, { method: 'POST', body: JSON.stringify({ amount }) }),
  counter: (id, amount) => request(`/negotiation/offers/${encodeURIComponent(id)}/counter`, { method: 'POST', body: JSON.stringify({ amount }) }),
  accept: (id) => request(`/negotiation/offers/${encodeURIComponent(id)}/accept`, { method: 'POST' }),
  reject: (id) => request(`/negotiation/offers/${encodeURIComponent(id)}/reject`, { method: 'POST' }),
  agreement: (id) => request(`/negotiation/agreements/${encodeURIComponent(id)}`),
}
