import type { ReactNode } from 'react'
import { createContext, useMemo, useReducer } from 'react'
import type { Product } from '../types/product'

type CartState = {
  items: Product[]
}

type CartAction =
  | { type: 'ADD'; payload: Product }
  | { type: 'REMOVE'; payload: string }
  | { type: 'CLEAR' }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD':
      return { items: [...state.items, action.payload] }
    case 'REMOVE':
      return { items: state.items.filter((item) => item.id !== action.payload) }
    case 'CLEAR':
      return { items: [] }
    default:
      return state
  }
}

type CartContextType = {
  cartItems: Product[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
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

  const value = useMemo(() => {
    const total = state.items.reduce((sum, item) => sum + item.price, 0)

    return {
      cartItems: state.items,
      addToCart: (product: Product) => dispatch({ type: 'ADD', payload: product }),
      removeFromCart: (productId: string) => dispatch({ type: 'REMOVE', payload: productId }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
      cartCount: state.items.length,
      total,
    }
  }, [state.items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

