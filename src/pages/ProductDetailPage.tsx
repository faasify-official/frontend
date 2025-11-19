import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, ArrowLeft, Heart } from 'lucide-react'
import { products } from '@data/products'
import ReviewBadge from '@components/ReviewBadge'
import { useCart } from '@hooks/useCart'
import { useAuth } from '@context/AuthContext'
import { apiGet } from '@utils/api'
import type { Product } from '../types/product'

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
  const { isSeller } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [productError, setProductError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const cartItem = product ? cartItems.find((item) => item.product.id === product.id) : undefined
  const quantity = cartItem?.quantity || 0

  // Fetch product from API or mock data
  useEffect(() => {
    if (!id) {
      setProductError('Product ID is required')
      setIsLoading(false)
      return
    }

    const fetchProduct = async () => {
      setIsLoading(true)
      setProductError(null)

      // First, try to find in mock data (for demo products)
      const mockProduct = products.find((item) => item.id === id)
      if (mockProduct) {
        setProduct(mockProduct)
        setIsLoading(false)
        return
      }

      // If not in mock data, try to fetch from API
      try {
        const response = await apiGet<{ item: Product }>(`/listings/${id}`)
        setProduct(response.item)
      } catch (err) {
        console.error('Error fetching product:', err)
        setProductError(err instanceof Error ? err.message : 'Failed to load product')
        setProduct(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [id])

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
        const data = await apiGet<{ reviews: Review[] }>(`/reviews/product/${id}`)
        setReviews(data.reviews ?? [])
      } catch (err) {
        console.error('Error fetching reviews:', err)
        // If reviews endpoint fails, just show empty state
        setReviews([])
        setReviewsError(null)
      } finally {
        setReviewsLoading(false)
      }
    }

    fetchReviews()
  }, [id])

  if (isLoading) {
    return (
      <section className="flex items-center justify-center py-12">
        <p className="text-slate-500">Loading product...</p>
      </section>
    )
  }

  if (productError || !product) {
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
          {!isSeller && (
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="absolute top-4 right-4 rounded-full bg-white/90 p-3 shadow-md hover:bg-white hover:scale-110 transition-all duration-300"
            >
              <Heart
                size={24}
                className={`transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'}`}
              />
            </button>
          )}
        </div>

        {/* Product Details and Cart Controls */}
        <div className="animate-fade-in-right space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-charcoal mb-2">{product.name}</h1>
            <p className="text-2xl font-semibold text-primary mb-4">${product.price.toFixed(2)}</p>
            <p className="text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          {!isSeller && (
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

                <Link
                  to="/cart"
                  className="btn-outline flex-1 text-center animate-button-hover flex items-center justify-center gap-2"
                >
                  View Cart
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="animate-fade-in-up pt-8 border-t border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="animate-stagger-2 text-2xl font-bold text-charcoal">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <ReviewBadge rating={reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length} showStars={true} />
              <span className="text-sm text-slate-500">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
            </div>
          )}
        </div>

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
          <div className="space-y-4">
            {reviews.map((review, idx) => (
              <div
                key={review.reviewId}
                className={`animate-stagger-${(idx % 6) + 1} group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {(review.reviewer || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-charcoal group-hover:text-primary transition-colors">
                          {review.reviewer || 'Verified customer'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <ReviewBadge rating={review.rating} showStars={true} />
                  </div>
                </div>
                {review.comment && (
                  <div className="pl-14">
                    <p className="text-sm text-slate-700 leading-relaxed">{review.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ProductDetailPage

