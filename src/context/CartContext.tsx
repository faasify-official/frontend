import type { ReactNode } from 'react'
import { createContext, useMemo, useReducer } from 'react'
import type { Product } from '../types/product'
import { useToast } from './ToastContext'

export type CartItem = {
  product: Product
  quantity: number
}

type CartState = {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD'; payload: Product }
  | { type: 'REMOVE'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
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
    default:
      return state
  }
}

type CartContextType = {
  cartItems: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
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
  const { showToast } = useToast()

  const value = useMemo(() => {
    const total = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

    return {
      cartItems: state.items,
      addToCart: (product: Product) => {
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

        dispatch({ type: 'ADD', payload: product })
        if (existingItem) {
          showToast(`${product.name} quantity updated in cart!`, 'success')
        } else {
          showToast(`${product.name} added to cart successfully!`, 'success')
        }
      },
      removeFromCart: (productId: string) => dispatch({ type: 'REMOVE', payload: productId }),
      updateQuantity: (productId: string, quantity: number) => {
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

        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } })
      },
      clearCart: () => dispatch({ type: 'CLEAR' }),
      cartCount,
      total,
    }
  }, [state.items, showToast])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

