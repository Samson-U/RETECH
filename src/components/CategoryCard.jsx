import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ImageWithFallback from './ImageWithFallback'

function CategoryCard({ category }) {
  return <Link className="category-card" to={`/shop?category=${category.name.toLowerCase()}`}>
    <ImageWithFallback src={category.image} alt={`${category.name} electronics`} />
    <div className="category-overlay"><span>{category.number}</span><strong>{category.name}</strong><ArrowUpRight size={20} /></div>
  </Link>
}

export default CategoryCard
