import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import type { Product } from '../types/product'
import { useCart } from '@hooks/useCart'

type Props = {
  product: Product
}

const ProductCard = ({ product }: Props) => {
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart()
  const cartItem = cartItems.find((item) => item.product.id === product.id)
  const quantity = cartItem?.quantity || 0

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(product.id)
    } else if (quantity === 0) {
      addToCart(product)
    } else {
      updateQuantity(product.id, newQuantity)
    }
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 backdrop-blur-sm">
            {product.category}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-semibold text-charcoal line-clamp-1">{product.name}</h3>
          <p className="mt-2 text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
        </div>
        <p className="flex-1 text-sm leading-relaxed text-slate-600 line-clamp-2">
          {product.description}
        </p>
        <div className="flex gap-2 pt-2">
          {quantity > 0 ? (
            <div className="flex flex-1 items-center gap-2 rounded-full border border-primary bg-primary/10">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="p-2 transition hover:bg-primary/20"
                aria-label="Decrease quantity"
              >
                <Minus size={16} className="text-primary" />
              </button>
              <div className="relative flex flex-1 items-center justify-center">
                <ShoppingCart size={18} className="text-primary" />
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                  {quantity}
                </span>
              </div>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="p-2 transition hover:bg-primary/20"
                aria-label="Increase quantity"
              >
                <Plus size={16} className="text-primary" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product)}
              className="btn-primary flex-1 text-sm font-medium"
            >
              Add to Cart
            </button>
          )}
          <Link
            to={`/product/${product.id}`}
            className="btn-outline flex-1 text-center text-sm font-medium"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  )
}

export default ProductCard

