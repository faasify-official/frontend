import { use, useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, ArrowLeft, Heart } from 'lucide-react'
import { products } from '@data/products'
import ReviewBadge from '@components/ReviewBadge'
import { useCart } from '@hooks/useCart'

type Review = {
  reviewId: string
  productId: string
  storeId: string
  userId: string
  reviewer?: string
  rating: number
  comment: string
  createdAt: string
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart()

  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const API_BASE_URL = import.meta.env.VITE_API_URL

  const product = useMemo(() => products.find((item) => item.id === id), [id])
  const cartItem = product ? cartItems.find((item) => item.product.id === product.id) : undefined
  const quantity = cartItem?.quantity || 0

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return sum / reviews.length
  }, [reviews])

  const handleQuantityChange = (newQuantity: number) => {
    if (!product) return
    if (newQuantity < 1) {
      removeFromCart(product.id)
    } else if (quantity === 0) {
      addToCart(product)
    } else {
      updateQuantity(product.id, newQuantity)
    }
  }

  // Fetch reviews for this product from the backend
  useEffect(() => {
    if (!id) return

    const fetchReviews = async () => {
      setReviewsLoading(true)
      setReviewsError(null)

      try {
        const res = await fetch(`${API_BASE_URL}/reviews/product/${id}`)
        if (!res.ok) {
          const text = await res.text()
          console.error('Failed to fetch reviews:', text)
          setReviewsError('Using sample reviews')
          // Keep hardcoded reviews as fallback
          return
        }

        const data = await res.json()
        setReviews(data.reviews ?? [])
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setReviewsError('Using sample reviews')
        // Keep hardcoded reviews as fallback
      } finally {
        setReviewsLoading(false)
      }
    }

    fetchReviews()
  }, [id, API_BASE_URL])


  if (!product) {
    return (
      <section className="space-y-4">
        <p className="text-lg font-semibold text-charcoal">Product not found.</p>
        <button onClick={() => navigate(-1)} className="btn-outline flex items-center gap-2">
          <ArrowLeft size={18} />
          Go back
        </button>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="animate-fade-in-left group flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        {/* Product Image */}
        <div className="animate-fade-in-left relative group">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <img
            src={product.image}
            alt={product.name}
            className="relative h-full w-full rounded-3xl object-cover shadow-lg hover:shadow-2xl transition-shadow duration-300"
          />
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="absolute top-4 right-4 rounded-full bg-white/90 p-3 shadow-md hover:bg-white hover:scale-110 transition-all duration-300"
          >
            <Heart
              size={24}
              className={`transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'}`}
            />
          </button>
        </div>

        {/* Product Details */}
        <div className="animate-fade-in-right space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="animate-stagger-1 flex items-center gap-3">
              <ReviewBadge
                rating={averageRating}
                label={
                  reviews.length > 0
                    ? `(${reviews.length} reviews)`
                    : '(No reviews yet)'
                }
              />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {product.category}
              </span>
            </div>
            <h1 className="animate-stagger-2 text-4xl font-extrabold text-charcoal leading-tight">
              {product.name}
            </h1>
            <p className="animate-stagger-3 text-base text-slate-600 leading-relaxed">
              {product.description}
            </p>
            <p className="animate-stagger-4 text-3xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </p>
          </div>

          {/* Actions */}
          <div className="animate-stagger-5 space-y-3">
            <div className="flex gap-3">
              {quantity > 0 ? (
                <div className="flex flex-1 items-center gap-3 rounded-full border-2 border-primary bg-primary/10 px-4 py-3 animate-button-hover">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="rounded-full p-2 transition hover:bg-primary/20"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={20} className="text-primary" />
                  </button>
                  <div className="relative flex flex-1 items-center justify-center">
                    <ShoppingCart size={22} className="text-primary" />
                    <span className="absolute -right-1 -top-1 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                      {quantity}
                    </span>
                  </div>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="rounded-full p-2 transition hover:bg-primary/20"
                    aria-label="Increase quantity"
                  >
                    <Plus size={20} className="text-primary" />
                  </button>
                </div>
              ) : (
                <button onClick={() => addToCart(product)} className="btn-primary flex-1 animate-button-hover">
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
              )}
              <Link to="/cart" className="btn-outline flex-1 text-center animate-button-hover flex items-center justify-center gap-2">
                View Cart
              </Link>
            </div>
          </div>

          {/* Info Cards */}
          <div className="animate-stagger-6 grid grid-cols-2 gap-3 pt-4">
            <div className="rounded-xl bg-green-50 border border-green-100 p-4 hover:bg-green-100/50 transition-colors">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">In Stock</p>
              <p className="mt-1 text-lg font-bold text-green-900">Available</p>
            </div>
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 hover:bg-primary/10 transition-colors">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">Free Shipping</p>
              <p className="mt-1 text-lg font-bold text-primary">Included</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="animate-fade-in-up pt-8 border-t border-slate-200">
        <h2 className="animate-stagger-2 text-2xl font-bold text-charcoal mb-6">Customer Reviews</h2>

        {reviewsLoading && (
          <div className="animate-fade-in py-8 text-center">
            <div className="inline-flex items-center gap-2 text-slate-500">
              <div className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
              <span>Loading reviews...</span>
            </div>
          </div>
        )}

        {!reviewsLoading && reviewsError && (
          <div className="animate-fade-in rounded-xl bg-primary/5 border border-primary/20 p-4 mb-6">
            <p className="text-sm font-semibold text-primary">{reviewsError}</p>
          </div>
        )}

        {!reviewsLoading && !reviewsError && reviews.length === 0 && (
          <div className="animate-fade-in rounded-xl bg-slate-50 border border-dashed border-slate-300 p-8 text-center">
            <p className="text-sm font-medium text-slate-600">
              There are no reviews for this product yet. Be the first to review it!
            </p>
          </div>
        )}

        {!reviewsLoading && !reviewsError && reviews.length > 0 && (
          <ul className="space-y-3">
            {reviews.map((review, idx) => (
              <li
                key={review.reviewId}
                className={`animate-stagger-${(idx % 6) + 1} group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300`}
              >
                <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
                  <span className="font-semibold text-charcoal group-hover:text-primary transition-colors">
                    {review.reviewer || 'Verified customer'}
                  </span>
                  <ReviewBadge rating={review.rating} />
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-700 mb-2 leading-relaxed">{review.comment}</p>
                )}
                <p className="text-xs text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default ProductDetailPage

