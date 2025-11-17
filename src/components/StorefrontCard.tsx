import { Link } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { useSubscription } from '../hooks/useSubscription'
import { useToast } from '@context/ToastContext'
import type { Storefront } from '../types/storefront'

type Props = {
    storefront: Storefront
}

const StorefrontCard = ({ storefront }: Props) => {
    const { isBuyer } = useAuth()
    const { isSubscribed, isLoading, isChecking, subscribe, unsubscribe } = useSubscription(storefront.storeId)
    const { showToast } = useToast()

    const handleSubscribe = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            await subscribe()
            showToast('Successfully subscribed to storefront!', 'success')
        } catch (error: any) {
            showToast(error.message || 'Failed to subscribe', 'error')
        }
    }

    const handleUnsubscribe = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            await unsubscribe()
            showToast('Successfully unsubscribed from storefront', 'success')
        } catch (error: any) {
            showToast(error.message || 'Failed to unsubscribe', 'error')
        }
    }

    return (
        <Link
            to={`/storefront/${storefront.storeId}`}
            className="group flex flex-col overflow-hidden rounded-3xl border-2 border-slate-100 bg-white shadow-lg transition-all hover:border-primary/20 hover:shadow-xl"
        >
            <div className="relative h-52 overflow-hidden">
                <img
                    src={storefront.image}
                    alt={storefront.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block rounded-lg bg-white/95 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 backdrop-blur-sm">
                        {storefront.category}
                    </span>
                </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-6">
                <div>
                    <h3 className="text-xl font-bold text-charcoal">{storefront.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                        {storefront.description}
                    </p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-500">Owner</span>
                        <span className="text-sm font-semibold text-charcoal">{storefront.ownerName || storefront.owner}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-medium text-slate-500">Products</span>
                        <span className="text-sm font-semibold text-primary">{storefront.itemsCount ?? storefront.items.length}</span>
                    </div>
                </div>
                {isBuyer && !isChecking && (
                    <button
                        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                        disabled={isLoading}
                        className={`w-full text-sm font-semibold ${isSubscribed
                            ? 'btn-outline'
                            : 'btn-primary'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isLoading ? 'Loading...' : isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                    </button>
                )}
                <button className="btn-primary w-full text-sm font-semibold">Explore Storefront</button>
            </div>
        </Link>
    )
}

export default StorefrontCard

