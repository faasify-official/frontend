import { useState, useEffect, useMemo } from 'react'
import StorefrontCard from '@components/StorefrontCard'
import SearchBar from '@components/SearchBar'
import { apiGet } from '@utils/api'
import { useSearch } from '@hooks/useSearch'
import type { Storefront } from '../types/storefront'

const CATEGORIES = [
    'All',
    'Lifestyle',
    'Handmade',
    'Food & Beverage',
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports & Outdoors',
    'Books & Media',
    'Other',
]

const StorefrontsPage = () => {
    const [storefronts, setStorefronts] = useState<Storefront[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string>('All')
    const { query, clearQuery } = useSearch()

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

    // Filter storefronts based on search query and category
    const filteredStorefronts = useMemo(() => {
        let filtered = storefronts

        // Filter by category
        if (selectedCategory !== 'All') {
            filtered = filtered.filter((storefront) => storefront.category === selectedCategory)
        }

        // Filter by search query
        if (query.trim()) {
            const normalizedQuery = query.toLowerCase().trim()
            filtered = filtered.filter((storefront) => {
                const nameMatch = storefront.name.toLowerCase().includes(normalizedQuery)
                const descriptionMatch = storefront.description.toLowerCase().includes(normalizedQuery)
                const categoryMatch = storefront.category.toLowerCase().includes(normalizedQuery)
                const ownerMatch = (storefront.ownerName || storefront.owner).toLowerCase().includes(normalizedQuery)

                return nameMatch || descriptionMatch || categoryMatch || ownerMatch
            })
        }

        return filtered
    }, [storefronts, query, selectedCategory])


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

            {/* Category Filter */}
            <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-slate-700">Filter by Category</h2>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                selectedCategory === category
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
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
                            {query.trim() || selectedCategory !== 'All'
                                ? `Showing ${filteredStorefronts.length} result${filteredStorefronts.length === 1 ? '' : 's'}`
                                : `Showing ${filteredStorefronts.length} storefront${filteredStorefronts.length === 1 ? '' : 's'}`}
                            {query.trim() && ` for "${query}"`}
                            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                        </p>
                        {(query.trim() || selectedCategory !== 'All') && (
                            <button
                                onClick={() => {
                                    clearQuery()
                                    setSelectedCategory('All')
                                }}
                                className="text-sm text-primary hover:underline"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredStorefronts.map((storefront) => (
                            <StorefrontCard key={storefront.storeId} storefront={storefront} />
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}

export default StorefrontsPage

