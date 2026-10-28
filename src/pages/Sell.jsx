import { ArrowUpRight, Check, Upload } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMarketplace } from '../context/useMarketplace'
import { useAuth } from '../context/useAuth'

const initialForm = { title: '', category: 'Computing', price: '', condition: 'Excellent', description: '', location: '' }
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

function Sell() {
  const [form, setForm] = useState(initialForm)
  const [images, setImages] = useState([])
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { addListing } = useMarketplace()
  const { user } = useAuth()

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setSubmitted(false)
  }
  const selectFiles = (selected) => {
    const next = [...selected]
    const invalid = next.find((file) => !allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024)
    if (invalid) { setErrors((current) => ({ ...current, images: 'Use JPG, PNG, or WebP images up to 5 MB each.' })); return }
    setErrors((current) => ({ ...current, images: '' }))
    setImages(next.map((file) => ({ file, preview: URL.createObjectURL(file) })))
  }

  const submit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Add a listing title.'
    if (!form.description.trim()) nextErrors.description = 'Add a short description.'
    if (!form.location.trim()) nextErrors.location = 'Add a location.'
    if (!form.price || Number(form.price) <= 0) nextErrors.price = 'Enter a positive price.'
    if (!images.length) nextErrors.images = 'Upload at least one product image.'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setErrors((current) => ({ ...current, form: '' }))

    const payload = new FormData()
    Object.entries({ ...form, price: Number(form.price) }).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') payload.append(key, String(value))
    })
    images.forEach(({ file }) => payload.append('images', file, file.name))

    addListing(payload)
      .then(() => {
        setSubmitted(true)
        setForm(initialForm)
        setImages([])
      })
      .catch((requestError) => {
        const serverMessage = requestError?.message || 'Invalid product data.'
        const fieldMessage = requestError?.field ? { [requestError.field]: requestError.message } : {}
        setErrors({
          ...fieldMessage,
          form: serverMessage,
        })
      })
      .finally(() => setSubmitting(false))
  }

  if (!user || !['seller', 'admin'].includes(user.role)) return <div className="page-shell simple-page"><p className="eyebrow">Seller account required</p><h1>List your<br /><em>old tech.</em></h1><div className="notice-box"><strong>Log in or create a seller account to publish a listing.</strong><Link className="button-link" to="/auth">Continue to account <ArrowUpRight size={17} /></Link></div></div>
  return <div className="page-shell sell-page"><div className="page-intro"><p className="eyebrow">Give it another chapter</p><h1>List your<br /><em>old tech.</em></h1><p>Create a listing for your seller account.</p></div><div className="sell-form-layout"><div className="form-intro"><p className="lead">Good objects deserve a second look.</p><p>Your listing is saved to MongoDB and managed from your seller account.</p><Link className="button-link" to="/shop">Browse the collection <ArrowUpRight size={17} /></Link></div><form className="listing-form" onSubmit={submit} noValidate><label>Title<input name="title" value={form.title} onChange={updateField} placeholder="e.g. iPad Pro 11-inch" />{errors.title && <small>{errors.title}</small>}</label><div className="form-row"><label>Category<select name="category" value={form.category} onChange={updateField}><option>Computing</option><option>Mobiles</option><option>Audio</option><option>Gaming</option><option>Photography</option><option>Accessories</option></select></label><label>Condition<select name="condition" value={form.condition} onChange={updateField}><option>Excellent</option><option>Good</option><option>Fair</option></select></label></div><div className="form-row"><label>Price (INR)<input name="price" type="number" min="1" step="1" value={form.price} onChange={updateField} placeholder="25000" />{errors.price && <small>{errors.price}</small>}</label><label>Location<input name="location" value={form.location} onChange={updateField} placeholder="Mumbai, IN" />{errors.location && <small>{errors.location}</small>}</label></div><label>Description<textarea name="description" rows="4" value={form.description} onChange={updateField} placeholder="Describe the condition and what is included." />{errors.description && <small>{errors.description}</small>}</label><label>Product images <span className="optional">JPG, PNG, WebP / 5 MB max</span><div className="upload-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); selectFiles(event.dataTransfer.files) }}><Upload size={20} /><span>Drag images here or</span><button type="button" onClick={() => document.getElementById('product-images').click()}>UPLOAD IMAGES</button><input id="product-images" name="images" hidden type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => selectFiles(event.target.files)} /></div>{errors.images && <small>{errors.images}</small>}<div className="upload-previews">{images.map(({ preview, file }, index) => <div key={`${file.name}-${file.lastModified}`}><img src={preview} alt={`Selected product ${index + 1}`} /><button type="button" onClick={() => { URL.revokeObjectURL(preview); setImages(images.filter((_, itemIndex) => itemIndex !== index)) }} aria-label={`Remove image ${index + 1}`}>×</button></div>)}</div></label><button className="button-link submit-button" type="submit" disabled={submitting}>{submitting ? 'Creating listing…' : 'Create listing'} <ArrowUpRight size={17} /></button>{errors.form && <p className="form-error">{errors.form}</p>}{submitted && <p className="success-message"><Check size={16} /> Listing added to the collection.</p>}</form></div></div>
}
export default Sell
