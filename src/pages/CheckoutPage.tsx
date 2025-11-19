import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@hooks/useCart'
import { useAuth } from '@context/AuthContext'
import { CardNumberElement, CardExpiryElement, CardCvcElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useToast } from '@context/ToastContext'
import { apiPost } from '@utils/api'
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react'

const CheckoutPage = () => {
  const { cartItems, total, clearCart } = useCart()
  const { user, isAuthenticated, isSeller } = useAuth()
  const navigate = useNavigate()
  const stripe = useStripe()
  const elements = useElements()
  const { showToast } = useToast()

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  })

  const [cardName, setCardName] = useState(user?.name || '')

  const [isProcessing, setIsProcessing] = useState(false)

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShippingInfo((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }
  
  // const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setPaymentInfo((prev) => ({
  //     ...prev,
  //     [e.target.name]: e.target.value,
  //   }))
  // }

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setIsProcessing(true)

  //   // Simulate order processing
  //   await new Promise((resolve) => setTimeout(resolve, 1500))

  //   // Clear cart and redirect
  //   clearCart()
  //   navigate('/cart', { state: { orderPlaced: true } })
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    if (!stripe || !elements) {
      showToast('Stripe is not ready yet. Please try again.', 'error')
      return
    }
  
    const cardNumberElement = elements.getElement(CardNumberElement)
    if (!cardNumberElement) {
      showToast('Payment form is not ready.', 'error')
      return
    }
  
    setIsProcessing(true)
  
    try {
      // Convert cart total (e.g. 98.99) to cents
      const amountInCents = Math.round(total * 100)
  
      // Ask your backend to create a PaymentIntent
      const { clientSecret } = await apiPost<{ clientSecret: string }>(
        '/payments/create-payment-intent',
        {
          amount: amountInCents,
          // use 'cad' if you prefer, or keep 'usd'
          currency: 'cad',
        },
      )
  
      // Confirm the payment with Stripe using the card input
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: shippingInfo.fullName,
            email: shippingInfo.email,
            address: {
              line1: shippingInfo.address,
              city: shippingInfo.city,
              postal_code: shippingInfo.zipCode,
              // you can map shippingInfo.country to ISO codes later
            },
          },
        },
      })
  
      if (error) {
        console.error(error)
        showToast(error.message || 'Payment failed. Please try again.', 'error')
        return
      }
  
      if (paymentIntent?.status === 'succeeded') {
        showToast('Payment successful! 🎉', 'success')
        console.log(cartItems.map((item) => item.product.storeId))
        // ⬇️ create order in backend DynamoDB
        await apiPost('/orders', {
          paymentIntentId: paymentIntent.id,
          amount: amountInCents,
          currency: 'cad',           // or 'cad'
          shippingInfo,              // full shipping object from your state
          items: cartItems.map((item) => ({
            itemId: item.product.id,
            storeId: item.product.storeId,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image,
          })),
        }).catch((err) => {
          console.error(err)
          showToast('Something went wrong while creating order.', 'error')
        })
  
        // Clear cart and redirect
        clearCart()
        navigate('/cart', { state: { orderPlaced: true } })
      } else {
        showToast(`Payment status: ${paymentIntent?.status}`, 'info')
      }
    } catch (err) {
      console.error(err)
      showToast('Something went wrong while processing payment.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }
  
  if (cartItems.length === 0) {
    return (
      <section className="space-y-8">
        <div className="animate-fade-in-up card flex flex-col items-center gap-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold text-charcoal">Your cart is empty</p>
            <p className="mt-1 text-sm text-slate-500">Add some items before checkout</p>
          </div>
          <Link to="/" className="btn-primary flex items-center gap-2">
            <ArrowLeft size={18} />
            Back to Shopping
          </Link>
        </div>
      </section>
    )
  }

  if (!isAuthenticated) {
    return (
      <section className="space-y-8">
        <div className="animate-fade-in-up card flex flex-col items-center gap-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock size={32} className="text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold text-charcoal">Sign in to continue</p>
            <p className="mt-1 text-sm text-slate-500">You need to be logged in to complete your purchase</p>
          </div>
          <Link to="/login" className="btn-primary">
            Log In
          </Link>
        </div>
      </section>
    )
  }

  // Redirect sellers - they cannot checkout
  if (isSeller) {
    return (
      <section className="space-y-8">
        <div className="animate-fade-in-up card flex flex-col items-center gap-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Lock size={32} className="text-slate-400" />
          </div>
          <div>
            <p className="text-lg font-semibold text-charcoal">Sellers cannot checkout</p>
            <p className="mt-1 text-sm text-slate-500">Only buyers can make purchases.</p>
          </div>
          <Link to="/" className="btn-primary flex items-center gap-2">
            <ArrowLeft size={18} />
            Go to Home
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-4xl font-extrabold text-charcoal">Checkout</h1>
        <p className="mt-2 text-sm text-slate-500">Complete your order securely</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Forms Section */}
        <div className="space-y-6">
          {/* Shipping Information */}
          <div className="animate-stagger-1 card space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <h2 className="text-lg font-bold text-charcoal">Shipping Information</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={shippingInfo.fullName}
                  onChange={handleShippingChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={shippingInfo.email}
                  onChange={handleShippingChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="address" className="text-sm font-semibold text-slate-700">
                  Street Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="123 Main St"
                  value={shippingInfo.address}
                  onChange={handleShippingChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-semibold text-slate-700">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="New York"
                  value={shippingInfo.city}
                  onChange={handleShippingChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="state" className="text-sm font-semibold text-slate-700">
                  State/Province
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="NY"
                  value={shippingInfo.state}
                  onChange={handleShippingChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="zipCode" className="text-sm font-semibold text-slate-700">
                  ZIP/Postal Code
                </label>
                <input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  placeholder="10001"
                  value={shippingInfo.zipCode}
                  onChange={handleShippingChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="country" className="text-sm font-semibold text-slate-700">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleShippingChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </div>
          </div>

         {/* Payment Information */}
          <div className="animate-stagger-2 card space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <h2 className="text-lg font-bold text-charcoal">Payment Information</h2>
            </div>

            <div className="space-y-4">
              {/* Name on Card */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Name on Card
                </label>
                <input
                  type="text"
                  placeholder="As shown on card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Card Number */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Card Number</label>
                <div className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <CardNumberElement
                    options={{
                      showIcon: true,
                    }}
                  />
                </div>
              </div>

              {/* Expiry + CVC */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Expiry Date
                  </label>
                  <div className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <CardExpiryElement />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    CVC
                  </label>
                  <div className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <CardCvcElement />
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <p className="text-xs font-medium text-blue-700">
                  🧪 Test card: <span className="font-mono">4242 4242 4242 4242</span> • Any future date • Any CVC
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <aside className="animate-stagger-3 card space-y-6 self-start lg:sticky lg:top-4">
          <div>
            <h2 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-primary" />
              Order Summary
            </h2>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {cartItems.map((item, idx) => {
              const itemTotal = item.product.price * item.quantity
              return (
                <div key={item.product.id} className={`animate-stagger-${(idx % 6) + 1} flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors`}>
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-charcoal truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.quantity} × ${item.product.price.toFixed(2)}
                    </p>
                    <p className="text-sm font-bold text-primary mt-1">
                      ${itemTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium text-charcoal">${total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Shipping</span>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Free</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Tax (10%)</span>
              <span className="font-medium text-charcoal">${(total * 0.1).toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-charcoal font-semibold">Total</span>
              <span className="text-2xl font-extrabold text-primary">
                ${(total * 1.1).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="btn-primary w-full font-semibold py-3 animate-button-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock size={18} />
                Complete Purchase
              </>
            )}
          </button>

          <Link to="/cart" className="block text-center text-sm text-slate-500 hover:text-primary transition-colors">
            ← Back to cart
          </Link>
        </aside>
      </form>
    </section>
  )
}

export default CheckoutPage

