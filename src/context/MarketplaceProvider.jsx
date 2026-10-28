/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { productApi } from '../services/api'
import { MarketplaceContext } from './MarketplaceContext'

const WISHLIST_KEY = 'retech-wishlist'

function readStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function MarketplaceProvider({ children }) {
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [wishlist, setWishlist] = useState(() => readStorage(WISHLIST_KEY, []))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProducts = useCallback(async () => {
    try {
      setProducts(await productApi.list())
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      queueMicrotask(() => setLoading(false))
    }
  }, [])

  useEffect(() => {
    const needsProducts = location.pathname === '/' || location.pathname === '/shop' || location.pathname.startsWith('/product/')
    if (!needsProducts) {
      setLoading(false)
      return
    }
    loadProducts()
  }, [loadProducts, location.pathname])

  const retry = useCallback(() => {
    setLoading(true)
    setError('')
    loadProducts()
  }, [loadProducts])

  const toggleWishlist = (productId) => {
    setWishlist((current) => {
      const next = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(next))
      return next
    })
  }

  const addListing = async (listing) => {
    const product = await productApi.create(listing)
    setProducts((current) => [product, ...current])
    return product
  }

  return <MarketplaceContext.Provider value={{ products, wishlist, toggleWishlist, addListing, loading, error, retry }}>{children}</MarketplaceContext.Provider>
}
