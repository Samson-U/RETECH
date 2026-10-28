import { Check, ArrowRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { formatPrice } from '../data/products'
function OrderConfirmation() { const { state } = useLocation(); const order = state?.order; return <div className="page-shell confirmation-page"><div className="confirmation-mark"><Check size={28} /></div><p className="eyebrow">Order placed / Payment not collected</p><h1>Thank<br /><em>you.</em></h1>{order ? <><p>Your order number is <strong>{order.orderNumber}</strong>.</p><p className="confirmation-total">Subtotal <strong>{formatPrice(order.subtotal)}</strong></p></> : <p>Order details are available from your account order history.</p>}<Link className="button-link" to="/orders">View order history <ArrowRight size={16} /></Link></div> }
export default OrderConfirmation
