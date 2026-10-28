import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { orderApi } from '../services/api'
import { formatPrice } from '../data/products'
function Orders() { const { user } = useAuth(); const [orders, setOrders] = useState([]); const [error, setError] = useState(''); useEffect(() => { if (user) orderApi.list().then(setOrders).catch((e) => setError(e.message)) }, [user]); if (!user) return <div className="page-shell simple-page"><h1>Log in to<br /><em>see orders.</em></h1><Link className="button-link" to="/auth">Go to account</Link></div>; return <div className="page-shell orders-page"><p className="eyebrow">Account / Orders</p><h1>Order<br /><em>history.</em></h1>{error && <p className="form-error">{error}</p>}{orders.length ? orders.map((order) => <article className="order-history-item" key={order._id}><div><p className="product-category">{order.orderNumber} / {order.status}</p><strong>{new Date(order.createdAt).toLocaleDateString()}</strong></div><strong>{formatPrice(order.subtotal)}</strong></article>) : <div className="empty-state"><p>No orders yet.</p></div>}</div> }
export default Orders
