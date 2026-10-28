import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function Auth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'seller' })
  const [error, setError] = useState('')
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    if (mode === 'register' && form.name.trim().length < 2) return setError('Please enter your name.')
    try {
      await (mode === 'login' ? login({ email: form.email, password: form.password }) : register(form))
      navigate(location.state?.from || '/account')
    } catch (requestError) {
      setError(requestError.message)
    }
  }
  return <div className="page-shell auth-page"><p className="eyebrow">RETECH / Account</p><h1>{mode === 'login' ? <>Welcome<br /><em>back.</em></> : <>Make room<br /><em>for more.</em></>}</h1><form className="listing-form auth-form" onSubmit={submit}>{mode === 'register' && <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>}<label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label><label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength="8" required /></label>{mode === 'register' && <label>Account type<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="seller">Seller</option><option value="buyer">Buyer</option></select></label>}{error && <p className="form-error">{error}</p>}<button className="button-link submit-button" type="submit">{mode === 'login' ? 'Log in' : 'Create account'} <ArrowUpRight size={17} /></button></form><p className="auth-switch">{mode === 'login' ? 'New to ReTech?' : 'Already have an account?'} <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'Create an account' : 'Log in'}</button></p><Link className="back-link" to="/shop">Continue browsing</Link></div>
}
export default Auth
