import HeroSection from '../components/HeroSection'
import CategoryGrid from '../components/CategoryGrid'
import ProductGrid from '../components/ProductGrid'
import SellBanner from '../components/SellBanner'
import { useMarketplace } from '../context/useMarketplace'

function Home() {
  const { products, loading, error, retry } = useMarketplace()
  return <><HeroSection /><CategoryGrid /><ProductGrid products={products} loading={loading} error={error} onRetry={retry} /><SellBanner /></>
}
export default Home
