import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductGrid from '../components/ProductGrid'
import { useMarketplace } from '../context/useMarketplace'

const categories = ['all', 'computing', 'mobiles', 'audio', 'gaming', 'photography', 'accessories']
const conditions = ['all', 'excellent', 'good', 'fair']

function Shop() {
  const { products, loading, error, retry } = useMarketplace()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const category = searchParams.get('category') || 'all'
  const condition = searchParams.get('condition') || 'all'
  const sort = searchParams.get('sort') || 'featured'

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'all' || value === 'featured') next.delete(key)
    else next.set(key, value)
    setSearchParams(next)
  }

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    const result = products.filter((product) => {
      const searchable = `${product.name} ${product.description}`.toLowerCase()
      return (!query || searchable.includes(query))
        && (category === 'all' || product.category.toLowerCase() === category)
        && (condition === 'all' || product.condition.toLowerCase() === condition)
    })
    return [...result].sort((a, b) => sort === 'low-high' ? a.price - b.price : sort === 'high-low' ? b.price - a.price : 0)
  }, [category, condition, products, search, sort])
  const availableCount = filteredProducts.filter((product) => product.status === 'available').length

  const clearFilters = () => {
    setSearch('')
    setSearchParams({})
  }

  return <div className="page-shell shop-page">
    <div className="page-intro"><p className="eyebrow">The collection / 2025</p><h1>All <em>products.</em></h1><p>Objects with a previous chapter, ready for yours.</p></div>
    <div className="shop-controls">
      <label className="search-field"><Search size={17} /><input type="search" value={search} placeholder="Search by name or description" onChange={(event) => { setSearch(event.target.value); updateFilter('search', event.target.value) }} /></label>
      <label className="select-field"><span>Sort</span><select value={sort} onChange={(event) => updateFilter('sort', event.target.value)}><option value="featured">Featured</option><option value="low-high">Price: low to high</option><option value="high-low">Price: high to low</option></select></label>
    </div>
    <div className="filter-row"><span>{availableCount} available / {filteredProducts.length} considered objects</span><div className="filter-groups"><div className="filter-group"><SlidersHorizontal size={14} /><span>Category</span>{categories.map((item) => <button className={category === item ? 'active' : ''} key={item} onClick={() => updateFilter('category', item)}>{item}</button>)}</div><div className="filter-group"><span>Condition</span>{conditions.map((item) => <button className={condition === item ? 'active' : ''} key={item} onClick={() => updateFilter('condition', item)}>{item}</button>)}</div></div>{(search || category !== 'all' || condition !== 'all' || sort !== 'featured') && <button className="clear-filters" onClick={clearFilters}>Clear <X size={13} /></button>}</div>
    <ProductGrid products={filteredProducts} showHeading={false} loading={loading} error={error} onRetry={retry} />
  </div>
}
export default Shop
