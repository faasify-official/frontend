import { Link } from 'react-router-dom'
import type { Product } from '../types/product'
import { useCart } from '@hooks/useCart'

type Props = {
  product: Product
}

const ProductCard = ({ product }: Props) => {
  const { addToCart } = useCart()

  return (
    <article className="card flex flex-col gap-4">
      <img
        src={product.image}
        alt={product.name}
        className="h-48 w-full rounded-xl object-cover"
        loading="lazy"
      />
      <div className="flex flex-1 flex-col gap-3">
        <div>
          <h3 className="text-lg font-semibold text-charcoal">{product.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{product.category}</p>
        </div>
        <p className="text-xl font-semibold text-charcoal">${product.price.toFixed(2)}</p>
        <p className="flex-1 text-sm text-slate-600">{product.description.slice(0, 90)}...</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => addToCart(product)} className="btn-primary flex-1">
            Add to Cart
          </button>
          <Link to={`/product/${product.id}`} className="btn-outline flex-1 text-center">
            View Details
          </Link>
        </div>
      </div>
    </article>
  )
}

export default ProductCard

