import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StorefrontCard from '@components/StorefrontCard'
import { apiGet } from '@utils/api'
import { useAuth } from '@context/AuthContext'
import type { Storefront } from '../types/storefront'

const HomePage = () => {
  const [storefronts, setStorefronts] = useState<Storefront[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, isBuyer, isSeller } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStorefronts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiGet<{ storefronts: Storefront[] }>('/storefronts')
        const allStorefronts = data.storefronts || []
        
        // Shuffle and get top 8 random storefronts
        const shuffled = [...allStorefronts].sort(() => Math.random() - 0.5)
        const limitedStorefronts = shuffled.slice(0, 8)
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

  

  const handleCreateStorefrontClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      // Redirect to sign up as seller
      navigate('/create-account?role=seller')
    } else {
      navigate('/create-storefront')
    }
  }

  return (
    <section className="flex flex-col gap-12">
      {/* Hero - Hide for logged in buyers */}
      {!isBuyer && (
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
              <Link 
                to={isAuthenticated ? "/create-storefront" : "/create-account?role=seller"} 
                onClick={!isAuthenticated ? handleCreateStorefrontClick : undefined}
                className="animate-stagger-3 btn-primary animate-button-hover"
              >
                Create a storefront
              </Link>
              {isAuthenticated && isSeller && (
                <Link to="/manage-storefront" className="animate-stagger-4 btn-outline-light hidden sm:inline-flex animate-button-hover">
                  Manage storefronts
                </Link>
              )}
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
      )}



      {/* Storefronts */}
      <div className="animate-fade-in-up space-y-4">
        <div className="animate-stagger-3 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-charcoal">Featured storefronts</h2>
            <p className="mt-1 text-sm text-slate-500">
              Browse storefronts and discover unique products from independent sellers.
            </p>
          </div>
          <Link to="/storefronts" className="btn-outline hidden sm:inline-flex">
            See all storefronts
          </Link>
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {storefronts.map((storefront) => (
              <StorefrontCard key={storefront.storeId} storefront={storefront} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default HomePage

