import { useState, useEffect, useRef } from 'react'
import StorefrontCard from '@components/StorefrontCard'
import { apiGet } from '@utils/api'
import type { Storefront } from '../types/storefront'

const HomePage = () => {
  const [storefronts, setStorefronts] = useState<Storefront[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchStorefronts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiGet<{ storefronts: Storefront[] }>('/storefronts')
        // Limit to 12 storefronts
        const limitedStorefronts = (data.storefronts || []).slice(0, 10)
        setStorefronts(limitedStorefronts)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch storefronts')
        setStorefronts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchStorefronts()
  }, [])

  // Enable mouse wheel horizontal scrolling
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      // Only handle vertical wheel scrolling
      if (e.deltaY !== 0) {
        e.preventDefault()
        container.scrollLeft += e.deltaY
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [storefronts])

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
            <h2 className="text-2xl font-semibold text-charcoal">Featured storefronts</h2>
            <p className="mt-1 text-sm text-slate-500">
              {normalizedQuery
                ? `Showing ${filteredStorefronts.length} result${filteredStorefronts.length === 1 ? '' : 's'} for “${query}”.`
                : 'Browse storefronts and discover unique products from independent sellers.'}
            </p>
          </div>
          <button className="btn-outline hidden sm:inline-flex">See all storefronts</button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-500">Loading storefronts...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-red-500">Error: {error}</p>
          </div>
        ) : storefronts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-500">No storefronts available</p>
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto pb-4 scrollbar-hide"
          >
            <div className="flex gap-6" style={{ minWidth: 'max-content' }}>
              {storefronts.map((storefront) => (
                <div key={storefront.storeId} className="flex-shrink-0" style={{ width: '320px' }}>
                  <StorefrontCard storefront={storefront} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default HomePage

