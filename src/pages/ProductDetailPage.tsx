import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
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

  const API_BASE_URL = import.meta.env.VITE_API_URL

  const cartItem = product ? cartItems.find((item) => item.product.id === product.id) : undefined
  const quantity = cartItem?.quantity || 0

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return sum / reviews.length
  }, [reviews])

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
        const res = await fetch(`${API_BASE_URL}/reviews/product/${id}`)
        if (!res.ok) {
          const text = await res.text()
          console.error('Failed to fetch reviews:', text)
          setReviewsError('Failed to load reviews.')
          setReviews([])
          return
        }

        const data = await res.json()
        setReviews(data.reviews ?? [])
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setReviewsError('Failed to load reviews.')
        setReviews([])
      } finally {
        setReviewsLoading(false)
      }
    }

    if (product) {
      fetchReviews()
    }
  }, [id, API_BASE_URL, product])

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
        <p className="text-lg font-semibold text-charcoal">
          {productError || 'Product not found.'}
        </p>
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
          <ReviewBadge
            rating={averageRating}
            label={
              reviews.length > 0
                ? `(${reviews.length} reviews)`
                : '(No reviews yet)'
            }
          />
          <h1 className="text-3xl font-semibold text-charcoal">{product.name}</h1>
          <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
          <p className="text-sm text-slate-600">{product.description}</p>
        </div>

        {!isSeller && (
          <div className="flex gap-3">
            {quantity > 0 ? (
              <div className="flex flex-1 items-center gap-3 rounded-full border-2 border-primary bg-primary/10 px-4 py-3">
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
              <button onClick={() => addToCart(product)} className="btn-primary flex-1">
                Add to Cart
              </button>
            )}
            <Link to="/cart" className="btn-outline flex-1 text-center">
              View Cart
            </Link>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-charcoal">Reviews</h2>

          {reviewsLoading && (
            <p className="text-sm text-slate-500">Loading reviews...</p>
          )}

          {!reviewsLoading && reviewsError && (
            <p className="text-sm text-red-500">{reviewsError}</p>
          )}

          {!reviewsLoading && !reviewsError && reviews.length === 0 && (
            <p className="text-sm text-slate-500">
              There are no reviews for this service yet.
            </p>
          )}

          {!reviewsLoading && !reviewsError && reviews.length > 0 && (
            <ul className="space-y-3">
              {reviews.map((review) => (
                <li
                  key={review.reviewId}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span className="font-semibold text-charcoal">
                      Verified customer
                    </span>
                    <ReviewBadge rating={review.rating} />
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(review.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

export default ProductDetailPage

