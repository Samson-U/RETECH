import { Heart, Menu, Search, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/useCart'

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  const { items } = useCart()

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="wordmark" onClick={closeMenu}>RETECH</Link>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
          <NavLink to="/shop" onClick={closeMenu}>Shop</NavLink>
          <NavLink to="/sell" onClick={closeMenu}>Sell</NavLink>
          <a href="/#categories" onClick={closeMenu}>Categories</a>
          <NavLink to="/about" onClick={closeMenu}>About</NavLink>
        </nav>
        <div className="header-actions">
          <Link className="icon-button" to="/shop" aria-label="Search"><Search size={18} strokeWidth={1.5} /></Link>
          <Link className="icon-button desktop-only" to="/account" aria-label="Account"><UserRound size={18} strokeWidth={1.5} /></Link>
          <Link className="icon-button desktop-only" to="/cart" aria-label={`Cart with ${items.length} items`}><span className="cart-count">{items.length}</span><Heart size={18} strokeWidth={1.5} /></Link>
          <button className="menu-button icon-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
