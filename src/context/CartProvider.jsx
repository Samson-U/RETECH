import { useState } from 'react'
import { CartContext } from './CartContext'

const CART_KEY = 'retech-cart'
function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]') } catch { return [] }
}
export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)
  const persist = (next) => { setItems(next); localStorage.setItem(CART_KEY, JSON.stringify(next)) }
  const addToCart = (product) => { if (!items.some((item) => item.id === product.id)) persist([...items, product]) }
  const removeFromCart = (id) => persist(items.filter((item) => item.id !== id))
  const clearCart = () => persist([])
  const subtotal = items.reduce((sum, item) => sum + item.price, 0)
  return <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, subtotal }}>{children}</CartContext.Provider>
}
