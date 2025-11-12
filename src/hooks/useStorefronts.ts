import { useState, useEffect } from 'react'
import { apiGet } from '@utils/api'
import { useAuth } from '@context/AuthContext'
import type { Storefront } from '../types/storefront'

export const useStorefronts = () => {
  const { isAuthenticated, isSeller } = useAuth()
  const [storefronts, setStorefronts] = useState<Storefront[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMyStorefronts = async () => {
    if (!isAuthenticated || !isSeller) {
      setStorefronts([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const data = await apiGet<{ storefronts: Storefront[] }>('/storefronts/my')
      setStorefronts(data.storefronts || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch storefronts')
      setStorefronts([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMyStorefronts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isSeller])

  return {
    storefronts,
    isLoading,
    error,
    refetch: fetchMyStorefronts,
  }
}

