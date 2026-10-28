import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Link to="/" className="wordmark footer-wordmark">RETECH</Link>
          <p className="footer-description">A considered marketplace for technology with more to give.</p>
        </div>
        <div className="footer-links">
          <div><span className="footer-label">Explore</span><Link to="/shop">Shop</Link><Link to="/sell">Sell</Link></div>
          <div><span className="footer-label">ReTech</span><Link to="/about">About</Link><a href="mailto:hello@retech.example">Contact <ArrowUpRight size={13} /></a></div>
        </div>
      </div>
      <div className="footer-bottom"><span>© 2025 RETECH MARKETPLACE</span><span>PRE-LOVED ELECTRONICS. RECONSIDERED.</span></div>
    </footer>
  )
}

export default Footer
