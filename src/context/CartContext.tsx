/**
 * Cart React context that keeps UI state aligned with the backend Cart Service.
 * The backend stores carts in DynamoDB and fronts them with Redis caching; the context calls those APIs
 * so the browser cart stays persistent across reloads while still feeling responsive locally.
 */
import type { ReactNode } from 'react'
import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react'
import type { Product } from '../types/product'
import { apiRequest } from '@utils/api'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

export type CartItem = {
  product: Product
  quantity: number
}

type ServerCartItem = {
  itemId: string
  quantity: number
  name?: string
  price?: number
  image?: string
  category?: string
  description?: string
  averageRating?: number
  storeId?: string
  availableQuantity?: number
}

type CartApiResponse = {
  items: ServerCartItem[]
  updatedAt?: string
  userId?: string
}

type CartState = {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD'; payload: Product }
  | { type: 'REMOVE'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'CLEAR' }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD': {
      const existingItem = state.items.find((item) => item.product.id === action.payload.id)
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.product.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }
      }
      return { items: [...state.items, { product: action.payload, quantity: 1 }] }
    }
    case 'REMOVE':
      return { items: state.items.filter((item) => item.product.id !== action.payload) }
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return { items: state.items.filter((item) => item.product.id !== action.payload.productId) }
      }
      return {
        items: state.items.map((item) =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      }
    case 'CLEAR':
      return { items: [] }
    case 'SET_CART':
      return { items: action.payload }
    default:
      return state
  }
}

type CartContextType = {
  cartItems: CartItem[]
  addToCart: (product: Product) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  cartCount: number
  total: number
}

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext<CartContextType | undefined>(undefined)

type Props = {
  children: ReactNode
}

export const CartProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })
  const { isAuthenticated, token } = useAuth()
  const { showToast } = useToast()

  // Convert the backend cart shape into the UI-friendly cart items we keep locally
  const mapServerItemsToCart = useCallback(
    (items: ServerCartItem[] = []): CartItem[] =>
      items.map((item) => ({
        product: {
          id: item.itemId,
          name: item.name || 'Item',
          price: item.price ?? 0,
          image:
            item.image ||
            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
          category: item.category || 'General',
          description: item.description || '',
          averageRating: item.averageRating ?? 0,
          reviews: [],
          quantity: item.availableQuantity,
          storeId: item.storeId,
        },
        quantity: item.quantity ?? 1,
      })),
    []
  )

  const sendCartRequest = useCallback(
    async <T,>(endpoint: string, options: RequestInit) => {
      const headers: HeadersInit = {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
      return apiRequest<T>(endpoint, { ...options, headers })
    },
    [token]
  )

  // Load the user's persisted cart when we know they are authenticated
  useEffect(() => {
    let cancelled = false

    const fetchCart = async () => {
      if (!isAuthenticated || !token) {
        dispatch({ type: 'SET_CART', payload: [] })
        return
      }

      try {
        const cart = await sendCartRequest<CartApiResponse>('/cart/items', { method: 'GET' })
        if (!cancelled) {
          dispatch({ type: 'SET_CART', payload: mapServerItemsToCart(cart.items) })
        }
      } catch (error) {
        console.error('Unable to load cart from backend:', error)
        if (!cancelled) {
          showToast('Unable to load your saved cart right now.', 'error')
        }
      }
    }

    fetchCart()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, token, showToast, sendCartRequest, mapServerItemsToCart])

  const value = useMemo(() => {
    const total = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
    const shouldSyncWithBackend = isAuthenticated && !!token
    const requireAuthMessage = 'Please log in to manage your cart.'

    return {
      cartItems: state.items,
      addToCart: async (product: Product) => {
        const existingItem = state.items.find((item) => item.product.id === product.id)
        const currentCartQuantity = existingItem?.quantity || 0
        const requestedQuantity = currentCartQuantity + 1
        const availableQuantity = product.quantity ?? Infinity

        if (availableQuantity < requestedQuantity) {
          showToast(
            `Only ${availableQuantity} ${availableQuantity === 1 ? 'item' : 'items'} available in stock for ${product.name}`,
            'error'
          )
          return
        }

        if (!shouldSyncWithBackend) {
          showToast(requireAuthMessage, 'error')
          throw new Error(requireAuthMessage)
        }

        try {
          const cart = await sendCartRequest<CartApiResponse>('/cart/items', {
            method: 'POST',
            body: JSON.stringify({
              itemId: product.id,
              quantity: requestedQuantity,
            }),
          })
          dispatch({ type: 'SET_CART', payload: mapServerItemsToCart(cart.items) })
          showToast(existingItem ? `${product.name} quantity updated in cart!` : `${product.name} added to cart successfully!`, 'success')
        } catch (error) {
          console.error('Error syncing add to cart:', error)
          const message = error instanceof Error ? error.message : 'Unable to add item to cart'
          showToast(message, 'error')
          throw error
        }
      },
      removeFromCart: async (productId: string) => {
        if (!shouldSyncWithBackend) {
          showToast(requireAuthMessage, 'error')
          throw new Error(requireAuthMessage)
        }

        try {
          const cart = await sendCartRequest<CartApiResponse>(`/cart/items/${productId}`, {
            method: 'DELETE',
          })
          dispatch({ type: 'SET_CART', payload: mapServerItemsToCart(cart.items) })
        } catch (error) {
          console.error('Error syncing remove from cart:', error)
          const message = error instanceof Error ? error.message : 'Unable to remove item from cart'
          showToast(message, 'error')
          throw error
        }
      },
      updateQuantity: async (productId: string, quantity: number) => {
        const item = state.items.find((item) => item.product.id === productId)
        if (!item) return

        const availableQuantity = item.product.quantity ?? Infinity
        if (availableQuantity < quantity) {
          showToast(
            `Only ${availableQuantity} ${availableQuantity === 1 ? 'item' : 'items'} available in stock`,
            'error'
          )
          return
        }

        if (!shouldSyncWithBackend) {
          showToast(requireAuthMessage, 'error')
          throw new Error(requireAuthMessage)
        }

        try {
          const cart = await sendCartRequest<CartApiResponse>(`/cart/items/${productId}`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity }),
          })
          dispatch({ type: 'SET_CART', payload: mapServerItemsToCart(cart.items) })
        } catch (error) {
          console.error('Error syncing quantity update:', error)
          const message = error instanceof Error ? error.message : 'Unable to update quantity right now'
          showToast(message, 'error')
          throw error
        }
      },
      clearCart: async () => {
        if (!shouldSyncWithBackend) {
          showToast(requireAuthMessage, 'error')
          throw new Error(requireAuthMessage)
        }

        try {
          const cart = await sendCartRequest<CartApiResponse>('/cart/items', { method: 'DELETE' })
          dispatch({ type: 'SET_CART', payload: mapServerItemsToCart(cart.items) })
        } catch (error) {
          console.error('Error syncing clear cart:', error)
          const message = error instanceof Error ? error.message : 'Unable to clear cart right now'
          showToast(message, 'error')
          throw error
        }
      },
      cartCount,
      total,
    }
  }, [state.items, showToast, isAuthenticated, token, mapServerItemsToCart, sendCartRequest])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

/*
Architecture note: Cart context now syncs with the Cart service (Lambda/Express + DynamoDB + Redis).
Cart items are fetched from the backend after authentication, keeping DynamoDB as the durable store
while Redis speeds up reads. The UI still uses local state to avoid flicker but the server-side cart
is treated as the source of truth so carts persist across reloads and sessions.
*/
