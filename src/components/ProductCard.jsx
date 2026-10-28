import { Heart, ArrowUpRight, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../data/products'
import ImageWithFallback from './ImageWithFallback'
import { useMarketplace } from '../context/useMarketplace'
import { useCart } from '../context/useCart'

function ProductCard({ product }) {
  const { wishlist, toggleWishlist } = useMarketplace()
  const isWishlisted = wishlist.includes(product.id)
  const { addToCart, items } = useCart()
  const inCart = items.some((item) => item.id === product.id)
  return <article className="product-card">
    <div className="product-image-wrap">
      <Link to={`/product/${product.id}`}><ImageWithFallback src={product.image} alt={product.name} /></Link>
      <button className={`wishlist-button ${isWishlisted ? 'is-wishlisted' : ''}`} aria-label={`${isWishlisted ? 'Remove' : 'Add'} ${product.name} ${isWishlisted ? 'from' : 'to'} wishlist`} aria-pressed={isWishlisted} onClick={() => toggleWishlist(product.id)}><Heart size={18} strokeWidth={1.5} fill={isWishlisted ? 'currentColor' : 'none'} /></button>
      <span className="condition-tag">{product.condition}</span>
    </div>
    <div className="product-meta"><div><p className="product-category">{product.category}</p><h3><Link to={`/product/${product.id}`}>{product.name}</Link></h3></div><strong>{formatPrice(product.price)}</strong></div>
    <button className="card-cart" disabled={product.status === 'sold' || inCart} onClick={() => addToCart(product)}><ShoppingBag size={14} /> {product.status === 'sold' ? 'Sold' : inCart ? 'In cart' : 'Add to cart'}</button>
    <Link className="card-arrow" to={`/product/${product.id}`} aria-label={`View ${product.name}`}><ArrowUpRight size={18} /></Link>
  </article>
}

export default ProductCard
