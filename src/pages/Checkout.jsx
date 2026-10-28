import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useCart } from '../context/useCart'
import { negotiationApi, orderApi } from '../services/api'
import { formatPrice } from '../data/products'
function Checkout() {
  const { user } = useAuth(); const { items, subtotal, clearCart, removeFromCart } = useCart(); const navigate = useNavigate()
  const agreementId = new URLSearchParams(window.location.search).get('agreementId')
  const [agreement, setAgreement] = useState(null); const [agreementLoading, setAgreementLoading] = useState(Boolean(agreementId))
  const [form, setForm] = useState({ name: user?.name || '', phone: '', address: '', city: '', postalCode: '' }); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!agreementId || !user) return
    negotiationApi.agreement(agreementId).then(setAgreement).catch((requestError) => setError(requestError.message)).finally(() => setAgreementLoading(false))
  }, [agreementId, user])
  if (!user) return <div className="page-shell simple-page"><p className="eyebrow">Checkout / Account</p><h1>Log in to<br /><em>continue.</em></h1><Link className="button-link" to="/auth">Go to account <ArrowRight size={16} /></Link></div>
  if (agreementLoading) return <div className="page-shell feedback-state"><p className="eyebrow">Checkout / Deal</p><h3>Verifying the<br /><em>locked price.</em></h3></div>
  if (!agreementId && !items.length) return <div className="page-shell simple-page"><p className="eyebrow">Checkout / Empty</p><h1>Your cart is<br /><em>empty.</em></h1><Link className="button-link" to="/shop">Browse collection <ArrowRight size={16} /></Link></div>
  if (agreementId && !agreement) return <div className="page-shell feedback-state"><p className="eyebrow">Checkout / Deal unavailable</p><h3>This agreement<br /><em>has expired.</em></h3><p>{error}</p><Link className="button-link" to="/shop">Back to collection <ArrowRight size={16} /></Link></div>
  const checkoutItems = agreement ? [{ id: agreement.product._id, name: agreement.product.title, price: agreement.agreedPrice, image: agreement.product.imageUrl }] : items
  const checkoutSubtotal = agreement ? agreement.agreedPrice : subtotal
  const submit = async (event) => { event.preventDefault(); setError(''); setLoading(true); try { const order = await orderApi.create({ ...(agreement ? { agreementId } : { productIds: items.map((item) => item.id) }), delivery: form, clientRequestId: crypto.randomUUID() }); if (agreement) removeFromCart(agreement.product._id); else clearCart(); navigate(`/orders/${order._id || order.id}`, { state: { order } }) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) } }
  return <div className="page-shell checkout-page"><p className="eyebrow">Checkout / {agreement ? 'Locked deal / demo pay on delivery' : 'Demo pay on delivery'}</p><h1>Almost<br /><em>there.</em></h1><div className="checkout-layout"><form className="listing-form" onSubmit={submit}><label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label><label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></label><label>Address<textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></label><div className="form-row"><label>City<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required /></label><label>Postal code<input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} required /></label></div>{error && <p className="form-error">{error}</p>}<button className="button-link submit-button" disabled={loading}>{loading ? 'Placing order...' : 'Place demo order'} <ArrowRight size={16} /></button></form><aside className="order-summary"><p className="eyebrow">Order summary</p>{checkoutItems.map((item) => <p key={item.id}>{item.name}<strong>{formatPrice(item.price)}</strong></p>)}<hr /><p>Subtotal<strong>{formatPrice(checkoutSubtotal)}</strong></p><small>No payment is collected in this demo checkout.</small></aside></div></div>
}
export default Checkout
