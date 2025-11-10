import { useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { products } from '@data/products'
import ReviewBadge from '@components/ReviewBadge'
import { useCart } from '@hooks/useCart'

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const product = useMemo(() => products.find((item) => item.id === id), [id])

  if (!product) {
    return (
      <section className="space-y-4">
        <p className="text-lg font-semibold text-charcoal">Product not found.</p>
        <button onClick={() => navigate(-1)} className="btn-outline">
          Go back
        </button>
      </section>
    )
  }

  return (
    <section className="grid gap-10 lg:grid-cols-2 lg:items-start">
      <img
        src={product.image}
        alt={product.name}
        className="h-full w-full rounded-3xl object-cover shadow-lg"
      />

      <div className="space-y-6">
        <div className="space-y-3">
          <ReviewBadge rating={product.averageRating} label={`(${product.reviews.length} reviews)`} />
          <h1 className="text-3xl font-semibold text-charcoal">{product.name}</h1>
          <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
          <p className="text-sm text-slate-600">{product.description}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => addToCart(product)} className="btn-primary flex-1">
            Add to Cart
          </button>
          <Link to="/cart" className="btn-outline flex-1 text-center">
            View Cart
          </Link>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-charcoal">Reviews</h2>
          <ul className="space-y-3">
            {product.reviews.map((review) => (
              <li key={review.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span className="font-semibold text-charcoal">{review.reviewer}</span>
                  <ReviewBadge rating={review.rating} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default ProductDetailPage

