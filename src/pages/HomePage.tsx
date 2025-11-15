import { useMemo } from 'react'
import { storefronts } from '@data/storefronts'
import StorefrontCard from '@components/StorefrontCard'
import { useSearch } from '@hooks/useSearch'

const HomePage = () => {
  const { query } = useSearch()
  const normalizedQuery = query.trim().toLowerCase()
  const filteredStorefronts = useMemo(() => {
    if (!normalizedQuery) {
      return storefronts
    }
    return storefronts.filter((storefront) => {
      const haystack = `${storefront.name} ${storefront.description} ${storefront.category} ${storefront.owner}`.toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [normalizedQuery])

  return (
    <section className="flex flex-col gap-10">
      <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-dark px-8 py-12 text-white shadow-lg sm:px-12">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            Your shop, simplified
          </span>
          <h1 className="text-4xl font-bold sm:text-5xl">Launch storefronts in minutes.</h1>
          <p className="text-base text-white/80 sm:text-lg">
            FaaSify lets you assemble and manage storefronts without the heavy lifting. Explore curated
            templates and jumpstart your commerce presence today.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-charcoal">Sample storefronts</h2>
            <p className="mt-1 text-sm text-slate-500">
              {normalizedQuery
                ? `Showing ${filteredStorefronts.length} result${filteredStorefronts.length === 1 ? '' : 's'} for “${query}”.`
                : 'Browse storefronts and discover unique products from independent sellers.'}
            </p>
          </div>
          <button className="btn-outline hidden sm:inline-flex">See all storefronts</button>
        </div>

        {filteredStorefronts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            No storefronts match “{query}”. Try searching by storefront name, owner, or category.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredStorefronts.map((storefront) => (
              <StorefrontCard key={storefront.storeId} storefront={storefront} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default HomePage

