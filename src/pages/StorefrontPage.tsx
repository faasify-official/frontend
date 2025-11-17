import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ProductCard from '@components/ProductCard'
import { apiGet } from '@utils/api'
import { storefronts as mockStorefronts } from '@data/storefronts'
import { products as mockProducts } from '@data/products'
import type { Storefront } from '../types/storefront'
import type { Product } from '../types/product'

// Mock store IDs that should use mock data
const MOCK_STORE_IDS = ['minimal-market', 'artisan-atelier', 'fresh-bites']

const StorefrontPage = () => {
    const { storeId } = useParams<{ storeId: string }>()
    const [storefront, setStorefront] = useState<Storefront | null>(null)
    const [items, setItems] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStorefrontData = async () => {
            if (!storeId) {
                setError('Store ID is required')
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            setError(null)

            // Check if this is a mock store
            const isMockStore = MOCK_STORE_IDS.includes(storeId)

            if (isMockStore) {
                // Use mock data for demo stores
                const mockStorefront = mockStorefronts.find((s) => s.storeId === storeId)
                if (mockStorefront) {
                    const mockItems = mockStorefront.items
                        .map((productId) => mockProducts.find((p) => p.id === productId))
                        .filter((product): product is Product => product !== undefined)

                    setStorefront(mockStorefront)
                    setItems(mockItems)
                    setIsLoading(false)
                    return
                }
            }

            // Try to fetch from API
            try {
                // Fetch storefront and items in parallel
                const [storefrontResponse, itemsResponse] = await Promise.all([
                    apiGet<{ storefront: Storefront }>(`/storefronts/${storeId}`),
                    apiGet<{ items: Product[] }>(`/listings?storeId=${storeId}`),
                ])

                setStorefront(storefrontResponse.storefront)
                setItems(itemsResponse.items || [])
            } catch (err) {
                console.error('Error fetching storefront data:', err)

                // Fallback to mock data if API fails and it's a known mock store
                if (isMockStore) {
                    const mockStorefront = mockStorefronts.find((s) => s.storeId === storeId)
                    if (mockStorefront) {
                        const mockItems = mockStorefront.items
                            .map((productId) => mockProducts.find((p) => p.id === productId))
                            .filter((product): product is Product => product !== undefined)

                        setStorefront(mockStorefront)
                        setItems(mockItems)
                        setIsLoading(false)
                        return
                    }
                }

                setError(err instanceof Error ? err.message : 'Failed to load storefront')
            } finally {
                setIsLoading(false)
            }
        }

        fetchStorefrontData()
    }, [storeId])

    if (isLoading) {
        return (
            <section className="flex flex-col items-center justify-center gap-4 py-12">
                <div className="text-slate-500">Loading storefront...</div>
            </section>
        )
    }

    if (error || !storefront) {
        return (
            <section className="flex flex-col items-center justify-center gap-4 py-12">
                <h1 className="text-2xl font-semibold text-charcoal">Storefront not found</h1>
                <p className="text-slate-500">
                    {error || "The storefront you're looking for doesn't exist."}
                </p>
            </section>
        )
    }

    return (
        <section className="mx-auto flex w-full max-w-7xl flex-col gap-10">
            {/* Storefront Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary-dark px-8 py-16 text-white shadow-xl sm:px-12">
                {storefront.image && (
                    <div className="absolute inset-0 opacity-20">
                        <img
                            src={storefront.image}
                            alt={storefront.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}
                <div className="relative max-w-3xl space-y-4">
                    <span className="inline-flex rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
                        {storefront.category}
                    </span>
                    <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">{storefront.name}</h1>
                    <p className="text-lg text-white/90 sm:text-xl">{storefront.description}</p>
                    <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-white/80">
                        <span>By {storefront.ownerName || storefront.owner}</span>
                        <span>•</span>
                        <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                    </div>
                </div>
            </div>

            {/* Storefront Items */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-semibold text-charcoal">All Items</h2>
                    <p className="text-sm text-slate-500">
                        {normalizedQuery
                            ? `Showing ${filteredProducts.length} result${filteredProducts.length === 1 ? '' : 's'} for “${query}”.`
                            : `Browse all products available from ${storefront.name}`}
                    </p>
                </div>

                {items.length === 0 ? (
                    <div className="card flex items-center justify-center py-16 text-center">
                        <div className="space-y-2">
                            <p className="text-lg font-medium text-slate-700">No items yet</p>
                            <p className="text-sm text-slate-500">
                                This storefront doesn't have any items available at the moment.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default StorefrontPage

