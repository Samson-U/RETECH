import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function SellBanner() {
  return <section className="sell-banner"><div><p className="eyebrow">Make room for what’s next</p><h2>Your old tech.<br /><em>Someone’s next favourite.</em></h2></div><div className="sell-banner-copy"><p>Give quality electronics a second life.</p><Link className="button-link button-light" to="/sell">List an item <ArrowUpRight size={18} /></Link></div></section>
}

export default SellBanner
