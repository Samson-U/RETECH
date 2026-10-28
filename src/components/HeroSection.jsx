import { ArrowDownRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ImageWithFallback from './ImageWithFallback'

function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Pre-loved electronics / New perspective</p>
        <h1>Great tech<br /><em>lives on.</em></h1>
        <p className="hero-support">Buy. Sell. Upgrade.<br />Premium quality. Second life.</p>
        <Link className="button-link" to="/shop">Explore collection <ArrowDownRight size={18} /></Link>
      </div>
      <div className="hero-visual">
        <ImageWithFallback src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1800&q=90" alt="Laptop on a neutral architectural surface" />
        <span className="image-caption">01 / RECONSIDERED</span>
      </div>
    </section>
  )
}

export default HeroSection
