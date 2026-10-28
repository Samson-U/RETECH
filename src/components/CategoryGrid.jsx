import { categories } from '../data/categories'
import CategoryCard from './CategoryCard'

function CategoryGrid() {
  return <section className="section category-section" id="categories">
    <div className="section-heading"><div><p className="eyebrow">Browse by intention</p><h2>Find your next<br /><em>essential.</em></h2></div><span className="section-index">/ 04</span></div>
    <div className="category-grid">{categories.map((category) => <CategoryCard key={category.name} category={category} />)}</div>
  </section>
}

export default CategoryGrid
