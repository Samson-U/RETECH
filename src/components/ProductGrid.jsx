import ProductCard from './ProductCard'

function ProductGrid({ products, showHeading = true, loading = false, error = '', onRetry }) {
  if (loading) return <div className="feedback-state"><p className="eyebrow">ReTech / Loading collection</p><h3>Gathering<br /><em>good objects.</em></h3></div>
  if (error) return <div className="feedback-state"><p className="eyebrow">Connection issue</p><h3>The collection<br /><em>is out of reach.</em></h3><p>{error}</p>{onRetry && <button className="button-link feedback-button" onClick={onRetry}>Try again</button>}</div>
  if (!products.length) return <div className="empty-state"><p className="eyebrow">No matching objects</p><h3>Nothing here<br /><em>yet.</em></h3><p>Try widening your search or clearing one of the filters.</p></div>
  return <section className="section products-section">
    {showHeading && <div className="section-heading products-heading"><div><p className="eyebrow">Selected for a second life.</p><h2>Curated <em>picks.</em></h2></div><a className="text-link" href="/shop">View all products <span>↗</span></a></div>}
    <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
  </section>
}

export default ProductGrid
