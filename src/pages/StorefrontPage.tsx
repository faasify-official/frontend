import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { storefronts } from '@data/storefronts'
import { products } from '@data/products'
import ProductCard from '@components/ProductCard'
import { useSearch } from '@hooks/useSearch'

const StorefrontPage = () => {
    const { storeId } = useParams<{ storeId: string }>()
    const { query, clearQuery, registerStorefront } = useSearch()

    // Find the storefront by ID
    // TODO: Replace with API call to fetch storefront data
    const storefront = storefronts.find((s) => s.storeId === storeId)

    useEffect(() => {
        if (!storefront) {
            registerStorefront(undefined)
            return
        }

        registerStorefront({ id: storefront.storeId, name: storefront.name })

        return () => {
            registerStorefront(undefined)
        }
    }, [storefront, registerStorefront])

    if (!storefront) {
        return (
            <section className="flex flex-col items-center justify-center gap-4 py-12">
                <h1 className="text-2xl font-semibold text-charcoal">Storefront not found</h1>
                <p className="text-slate-500">The storefront you're looking for doesn't exist.</p>
            </section>
        )
    }

    // Look up products by their IDs
    // TODO: Replace with API call to fetch products for this storefront
    const storefrontProducts = useMemo(
        () =>
            storefront.items
                .map((productId) => products.find((p) => p.id === productId))
                .filter((product): product is NonNullable<typeof product> => product !== undefined),
        [storefront],
    )

    const normalizedQuery = query.trim().toLowerCase()
    const filteredProducts = useMemo(() => {
        if (!normalizedQuery) {
            return storefrontProducts
        }

        return storefrontProducts.filter((product) => {
            const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase()
            return haystack.includes(normalizedQuery)
        })
    }, [normalizedQuery, storefrontProducts])

    return (
        <section className="flex flex-col gap-10">
            {/* Storefront Header */}
            <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-dark px-8 py-12 text-white shadow-lg sm:px-12">
                <div className="max-w-2xl space-y-4">
                    <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                        {storefront.category}
                    </span>
                    <h1 className="text-4xl font-bold sm:text-5xl">{storefront.name}</h1>
                    <p className="text-base text-white/80 sm:text-lg">{storefront.description}</p>
                    <div className="flex items-center gap-4 pt-2">
                        <span className="text-sm text-white/70">By {storefront.owner}</span>
                        <span className="text-sm text-white/70">•</span>
                        <span className="text-sm text-white/70">{storefront.items.length} items</span>
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

                {filteredProducts.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
                        {storefrontProducts.length === 0 ? (
                            <p className="text-slate-500">This storefront doesn't have any items yet.</p>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-slate-500">No items match “{query}”.</p>
                                <button type="button" className="btn-outline mx-auto" onClick={clearQuery}>
                                    Clear search
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default StorefrontPage

