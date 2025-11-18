import { useState, useEffect, useMemo, useRef } from 'react'
import StorefrontCard from '@components/StorefrontCard'
import SearchBar from '@components/SearchBar'
import { apiGet } from '@utils/api'
import { useSearch } from '@hooks/useSearch'
import type { Storefront } from '../types/storefront'

const StorefrontsPage = () => {
    const [storefronts, setStorefronts] = useState<Storefront[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { query, clearQuery } = useSearch()
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchStorefronts = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const data = await apiGet<{ storefronts: Storefront[] }>('/storefronts')
                setStorefronts(data.storefronts || [])
            } catch (err: any) {
                setError(err.message || 'Failed to fetch storefronts')
                setStorefronts([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchStorefronts()
    }, [])

    // Filter storefronts based on search query
    const filteredStorefronts = useMemo(() => {
        if (!query.trim()) {
            return storefronts
        }

        const normalizedQuery = query.toLowerCase().trim()
        return storefronts.filter((storefront) => {
            const nameMatch = storefront.name.toLowerCase().includes(normalizedQuery)
            const descriptionMatch = storefront.description.toLowerCase().includes(normalizedQuery)
            const categoryMatch = storefront.category.toLowerCase().includes(normalizedQuery)
            const ownerMatch = (storefront.ownerName || storefront.owner).toLowerCase().includes(normalizedQuery)

            return nameMatch || descriptionMatch || categoryMatch || ownerMatch
        })
    }, [storefronts, query])


    return (
        <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal sm:text-4xl">All Storefronts</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Discover unique products from independent sellers
                    </p>
                </div>
                <div className="flex items-center justify-center">
                    <SearchBar />
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <p className="text-slate-500">Loading storefronts...</p>
                </div>
            ) : error ? (
                <div className="flex items-center justify-center py-12">
                    <p className="text-red-500">Error: {error}</p>
                </div>
            ) : filteredStorefronts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-slate-500">
                        {query.trim()
                            ? `No storefronts found matching "${query}"`
                            : 'No storefronts available'}
                    </p>
                    {query.trim() && (
                        <button
                            onClick={clearQuery}
                            className="mt-4 text-sm text-primary hover:underline"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            {query.trim()
                                ? `Showing ${filteredStorefronts.length} result${filteredStorefronts.length === 1 ? '' : 's'} for "${query}"`
                                : `Showing ${filteredStorefronts.length} storefront${filteredStorefronts.length === 1 ? '' : 's'}`}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ minWidth: 'max-content' }}>
                        {filteredStorefronts.map((storefront) => (
                            <div key={storefront.storeId} className="flex-shrink-0" style={{ width: '320px' }}>
                                <StorefrontCard storefront={storefront} />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}

export default StorefrontsPage

