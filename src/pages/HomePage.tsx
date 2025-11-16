import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { storefronts } from '@data/storefronts'
import StorefrontCard from '@components/StorefrontCard'
import ProductCard from '@components/ProductCard'
import { products } from '@data/products'
import { useSearch } from '@hooks/useSearch'

const HomePage = () => {
  const { query } = useSearch()
  const normalizedQuery = query.trim().toLowerCase()

  const filteredStorefronts = useMemo(() => {
    if (!normalizedQuery) return storefronts
    return storefronts.filter((storefront) => {
      const haystack = `${storefront.name} ${storefront.description} ${storefront.category} ${storefront.owner}`.toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [normalizedQuery])

  const featuredProducts = products.slice(0, 6)

  return (
    <section className="flex flex-col gap-12">
      {/* Hero */}
      <div className="animate-fade-in-up grid gap-8 rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-8 shadow-lg sm:grid-cols-2 sm:items-center">
        <div className="space-y-4 text-white">
          <span className="animate-slide-in-down inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            Marketplace for builders
          </span>
          <h1 className="animate-stagger-1 text-3xl font-extrabold leading-tight sm:text-4xl">
            Launch beautiful storefronts and sell fast.
          </h1>
          <p className="animate-stagger-2 text-sm text-white/90 sm:text-base">
            Create, customize, and manage storefronts with a serverless backend. Curated templates and
            powerful developer tools — everything you need to ship faster.
          </p>

          <div className="mt-4 flex gap-3">
            <Link to="/create-storefront" className="animate-stagger-3 btn-primary animate-button-hover">
              Create a storefront
            </Link>
            <Link to="/manage-storefront" className="animate-stagger-4 btn-outline-light hidden sm:inline-flex animate-button-hover">
              Manage storefronts
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/80">
            <span className="animate-stagger-4 rounded-full bg-white/10 px-3 py-1">No infra required</span>
            <span className="animate-stagger-5 rounded-full bg-white/10 px-3 py-1">Built-in payments</span>
            <span className="animate-stagger-6 rounded-full bg-white/10 px-3 py-1">Fast to launch</span>
          </div>
        </div>

        <div className="animate-fade-in-right hidden sm:block">
          <img
            src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80"
            alt="Storefront preview"
            className="w-full rounded-2xl object-cover shadow-xl hover:shadow-2xl transition-shadow duration-300"
            loading="lazy"
          />
        </div>
      </div>

      {/* Featured products */}
      <div className="animate-fade-in-up space-y-4">
        <div className="animate-stagger-2 flex items-baseline justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-charcoal">Featured products</h2>
            <p className="mt-1 text-sm text-slate-500">Handpicked items from our top storefronts.</p>
          </div>
          <Link to="/" className="text-sm text-primary hover:underline">
            See all products
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {featuredProducts.map((product, idx) => (
            <div key={product.id} className={`animate-stagger-${(idx % 6) + 1}`}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Storefronts */}
      <div className="animate-fade-in-up space-y-4">
        <div className="animate-stagger-3 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-charcoal">Explore storefronts</h2>
            <p className="mt-1 text-sm text-slate-500">
              {normalizedQuery
                ? `Showing ${filteredStorefronts.length} result${filteredStorefronts.length === 1 ? '' : 's'} for “${query}”.`
                : 'Browse storefronts and discover unique products from independent sellers.'}
            </p>
          </div>
          <Link to="/" className="btn-outline hidden sm:inline-flex">
            Browse all
          </Link>
        </div>

        {filteredStorefronts.length === 0 ? (
          <div className="animate-fade-in rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            No storefronts match "{query}". Try searching by storefront name, owner, or category.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredStorefronts.map((storefront, idx) => (
              <div key={storefront.storeId} className={`animate-stagger-${(idx % 6) + 1}`}>
                <StorefrontCard storefront={storefront} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default HomePage

