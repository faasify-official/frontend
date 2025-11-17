import { useState, useEffect } from 'react'
import { apiGet, apiPost } from '@utils/api'
import { useAuth } from '@context/AuthContext'

export const useSubscription = (storeId: string) => {
  const { user, isBuyer, isAuthenticated } = useAuth()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isAuthenticated || !isBuyer || !storeId || !user?.email) {
        setIsChecking(false)
        return
      }

      try {
        const data = await apiGet<{ subscriptions: Array<{ buyerEmail: string }> }>(
          `/subscriptions/${storeId}`
        )
        const subscribed = data.subscriptions?.some(
          (sub) => sub.buyerEmail === user.email
        ) || false
        setIsSubscribed(subscribed)
      } catch (error) {
        // If error (e.g., no subscriptions yet), user is not subscribed
        setIsSubscribed(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkSubscription()
  }, [storeId, isAuthenticated, isBuyer, user?.email])

  const subscribe = async () => {
    if (!isAuthenticated || !isBuyer) return

    setIsLoading(true)
    try {
      await apiPost('/subscriptions/subscribe', { storeId })
      setIsSubscribed(true)
      return true
    } catch (error: any) {
      throw new Error(error.message || 'Failed to subscribe')
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async () => {
    if (!isAuthenticated || !isBuyer) return

    setIsLoading(true)
    try {
      await apiPost('/subscriptions/unsubscribe', { storeId })
      setIsSubscribed(false)
      return true
    } catch (error: any) {
      throw new Error(error.message || 'Failed to unsubscribe')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isSubscribed,
    isLoading,
    isChecking,
    subscribe,
    unsubscribe,
  }
}

