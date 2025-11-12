import { useParams } from 'react-router-dom'
import { storefronts } from '@data/storefronts'
import { products } from '@data/products'
import ProductCard from '@components/ProductCard'

const StorefrontPage = () => {
    const { storeId } = useParams<{ storeId: string }>()

    // Find the storefront by ID
    // TODO: Replace with API call to fetch storefront data
    const storefront = storefronts.find((s) => s.storeId === storeId)

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
    const storefrontProducts = storefront.items
        .map((productId) => products.find((p) => p.id === productId))
        .filter((product): product is NonNullable<typeof product> => product !== undefined)

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
                <div>
                    <h2 className="text-2xl font-semibold text-charcoal">All Items</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Browse all products available from {storefront.name}
                    </p>
                </div>

                {storefrontProducts.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                        <p className="text-slate-500">This storefront doesn't have any items yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {storefrontProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default StorefrontPage

