import { ArrowLeft, ArrowRight, Check, Copy, Heart, MapPin, Share2, ShoppingBag, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import ImageWithFallback from '../components/ImageWithFallback'
import ProductGrid from '../components/ProductGrid'
import { formatPrice } from '../data/products'
import { useMarketplace } from '../context/useMarketplace'
import { useCart } from '../context/useCart'
import { useAuth } from '../context/useAuth'
import { negotiationApi, productApi } from '../services/api'
function ProductDetails() {
  const { productId } = useParams(); const navigate = useNavigate(); const location = useLocation(); const { products, loading, error, retry, wishlist, toggleWishlist } = useMarketplace(); const { addToCart, items } = useCart(); const { user } = useAuth(); const [activeImage, setActiveImage] = useState(0); const [shared, setShared] = useState(false); const [contactError, setContactError] = useState(''); const [dealLoading, setDealLoading] = useState(false)
  if (loading) return <div className="page-shell feedback-state"><p className="eyebrow">ReTech / Loading item</p><h3>Finding the<br /><em>right object.</em></h3></div>
  if (error || !products.length) return <div className="page-shell feedback-state"><p className="eyebrow">Connection issue</p><h3>This item<br /><em>is unavailable.</em></h3><p>{error || 'The product collection is empty.'}</p>{error && <button className="button-link feedback-button" onClick={retry}>Try again</button>}</div>
  const product = products.find((item) => item.id === productId)
  if (!product) return <div className="page-shell feedback-state"><p className="eyebrow">404 / Product not found</p><h3>This object<br /><em>has moved on.</em></h3><Link className="button-link" to="/shop">Back to collection <ArrowLeft size={16} /></Link></div>
  const images = product.images?.length ? product.images : [product.image]; const sold = product.status === 'sold'; const inCart = items.some((item) => item.id === product.id); const isOwner = user && String(product.seller?._id || product.seller) === String(user.id || user._id)
  const share = async () => { const data = { title: product.name, text: product.description, url: window.location.href }; if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(window.location.href); setShared(true) } }
  const contact = async () => { if (!user) { window.location.assign('/auth'); return } try { const seller = await productApi.contact(product.id); window.location.assign(`mailto:${seller.email}?subject=${encodeURIComponent(`ReTech enquiry: ${product.name}`)}`) } catch (requestError) { setContactError(requestError.message) } }
  const startDeal = async () => {
    if (!user) { navigate('/auth', { state: { from: location.pathname } }); return }
    setDealLoading(true)
    setContactError('')
    try {
      const conversation = await negotiationApi.start(product.id)
      const conversationId = conversation?.conversation?._id || conversation?.conversation?.id
      if (!conversationId) throw new Error('The server did not return a conversation ID.')
      navigate(`/deals/${conversationId}`)
    } catch (requestError) { setContactError(requestError.message) } finally { setDealLoading(false) }
  }
  const related = products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 3)
  return <div className="page-shell detail-page"><Link className="back-link" to="/shop"><ArrowLeft size={16} /> Back to collection</Link><div className="detail-layout"><div className="detail-gallery"><div className="detail-image"><ImageWithFallback src={images[activeImage]} alt={product.name} /></div>{images.length > 1 && <div className="thumbnail-row">{images.map((image, index) => <button className={activeImage === index ? 'active' : ''} key={image} onClick={() => setActiveImage(index)}><ImageWithFallback src={image} alt={`${product.name} view ${index + 1}`} /></button>)}</div>}</div><div className="detail-copy"><p className="eyebrow">{product.category} / {product.condition}</p><h1>{product.name}</h1><p className="detail-price">{formatPrice(product.price)}</p><p className="detail-location"><MapPin size={15} /> {product.location || 'Location available from seller'}</p><p className="detail-description">{product.description}</p><div className="detail-line"><ShieldCheck size={18} /> {sold ? 'This item has already found a second life.' : product.dealLocked ? 'This item is temporarily reserved by an active agreement.' : 'Available as a single physical listing.'}</div><div className="detail-actions"><button className="button-link" disabled={sold || product.dealLocked} onClick={() => addToCart(product)}><ShoppingBag size={16} /> {sold || product.dealLocked ? 'Unavailable' : inCart ? 'In cart' : 'Add to cart'}</button><Link className={`button-link ${sold || product.dealLocked ? 'disabled-link' : ''}`} to={sold || product.dealLocked ? '#' : '/checkout'} onClick={(event) => { if (sold || product.dealLocked) event.preventDefault(); else if (!inCart) addToCart(product) }}>{sold ? 'Sold' : product.dealLocked ? 'Reserved' : 'Buy now'} <ArrowRight size={16} /></Link><button className="button-link deal-button" disabled={sold || product.dealLocked || dealLoading || isOwner} onClick={startDeal}>MAKE A DEAL</button></div><div className="detail-secondary"><button onClick={() => toggleWishlist(product.id)}><Heart size={16} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} /> {wishlist.includes(product.id) ? 'Remove wishlist' : 'Add to wishlist'}</button><button onClick={share}>{shared ? <Check size={16} /> : navigator.share ? <Share2 size={16} /> : <Copy size={16} />} {shared ? 'Link copied' : 'Share product'}</button><button onClick={contact}><span>@</span> Contact seller</button></div>{contactError && <p className="form-error">{contactError}</p>}</div></div>{related.length > 0 && <section className="related-section"><div className="section-heading"><h2>Related <em>objects.</em></h2></div><ProductGrid products={related} showHeading={false} /></section>}</div>
}
export default ProductDetails
