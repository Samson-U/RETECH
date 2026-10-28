import { ArrowRight, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import ImageWithFallback from '../components/ImageWithFallback'
import { formatPrice } from '../data/products'
import { useCart } from '../context/useCart'
function Cart() {
  const { items, removeFromCart, subtotal } = useCart()
  return <div className="page-shell cart-page"><p className="eyebrow">Your selection</p><h1>Shopping<br /><em>cart.</em></h1>{!items.length ? <div className="empty-state"><p>Your cart is ready for something considered.</p><Link className="button-link" to="/shop">Browse collection <ArrowRight size={16} /></Link></div> : <><div className="cart-list">{items.map((item) => <article className="cart-item" key={item.id}><ImageWithFallback src={item.image} alt={item.name} /><div><p className="product-category">{item.category} / {item.condition}</p><h3>{item.name}</h3><p>{item.seller?.name || 'Independent seller'}</p></div><strong>{formatPrice(item.price)}</strong><button aria-label={`Remove ${item.name}`} onClick={() => removeFromCart(item.id)}><Trash2 size={16} /></button></article>)}</div><div className="cart-summary"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong><Link className="button-link" to="/checkout">Continue to checkout <ArrowRight size={16} /></Link></div></>}</div>
}
export default Cart
