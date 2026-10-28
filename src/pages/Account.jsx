import { Check, Edit3, LogOut, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, productApi } from '../services/api'
import { useAuth } from '../context/useAuth'

function Account() {
  const { user, loading: authLoading, logout } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const navigate = useNavigate()
  useEffect(() => {
    if (!authLoading && !user) navigate('/auth', { state: { from: '/account' }, replace: true })
    if (user) authApi.listings().then(setListings).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false))
  }, [authLoading, navigate, user])
  if (authLoading || !user) return <div className="page-shell feedback-state"><p className="eyebrow">Account / Loading</p><h3>Checking<br /><em>credentials.</em></h3></div>
  const save = async (product) => { try { const saved = await productApi.update(product.id, product); setListings((current) => current.map((item) => item.id === saved.id ? saved : item)); setEditing(null) } catch (requestError) { setError(requestError.message) } }
  const remove = async (id) => { try { await productApi.remove(id); setListings((current) => current.filter((item) => item.id !== id)) } catch (requestError) { setError(requestError.message) } }
  return <div className="page-shell account-page"><div className="account-header"><div><p className="eyebrow">My account / {user.role}</p><h1>{user.name}<br /><em>your listings.</em></h1><p>{user.email}</p></div><button className="button-link account-logout" onClick={() => { logout(); navigate('/') }}><LogOut size={15} /> Log out</button></div>{error && <p className="form-error">{error}</p>}<div className="account-listings"><div className="section-heading"><h2>Published <em>objects.</em></h2><span className="section-index">/ {listings.length.toString().padStart(2, '0')}</span></div>{loading ? <div className="feedback-state"><p>Loading your listings...</p></div> : listings.length ? listings.map((product) => editing?.id === product.id ? <EditListing key={product.id} product={editing} setProduct={setEditing} onSave={save} onCancel={() => setEditing(null)} /> : <article className="account-listing" key={product.id}><div><p className="product-category">{product.category} / {product.status}</p><h3>{product.name}</h3><p>{product.description}</p></div><div className="account-listing-actions"><button aria-label={`Edit ${product.name}`} onClick={() => setEditing({ ...product })}><Edit3 size={16} /></button><button aria-label={`Mark ${product.name} as sold`} onClick={() => save({ ...product, status: product.status === 'sold' ? 'available' : 'sold' })}>{product.status === 'sold' ? <Check size={16} /> : 'SOLD'}</button><button aria-label={`Delete ${product.name}`} onClick={() => remove(product.id)}><X size={16} /></button></div></article>) : <div className="empty-state"><p>No listings yet. Add your first object from the Sell page.</p></div>}</div></div>
}

function EditListing({ product, setProduct, onSave, onCancel }) {
  return <div className="account-edit"><input value={product.name} onChange={(event) => setProduct({ ...product, name: event.target.value, title: event.target.value })} /><textarea value={product.description} onChange={(event) => setProduct({ ...product, description: event.target.value })} /><div><button onClick={() => onSave(product)}><Save size={15} /> Save</button><button onClick={onCancel}><X size={15} /> Cancel</button></div></div>
}
export default Account
