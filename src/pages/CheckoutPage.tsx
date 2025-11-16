import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@hooks/useCart'
import { useAuth } from '@context/AuthContext'
import { CardNumberElement, CardExpiryElement, CardCvcElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useToast } from '@context/ToastContext'
import { apiPost } from '@utils/api'

const CheckoutPage = () => {
  const { cartItems, total, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
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

  // const [paymentInfo, setPaymentInfo] = useState({
  //   cardNumber: '',
  //   cardName: '',
  //   expiryDate: '',
  //   cvv: '',
  // })
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
        <div className="card flex flex-col items-center gap-4 text-center">
          <p className="text-lg font-medium text-charcoal">Your cart is empty.</p>
          <Link to="/" className="btn-primary">
            Browse storefronts
          </Link>
        </div>
      </section>
    )
  }

  if (!isAuthenticated) {
    return (
      <section className="space-y-8">
        <div className="card flex flex-col items-center gap-4 text-center">
          <p className="text-lg font-medium text-charcoal">Please log in to checkout.</p>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-charcoal">Checkout</h1>
        <p className="text-sm text-slate-500">Complete your order by filling in the details below.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* Shipping Information */}
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-charcoal">Shipping Information</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="fullName" className="text-sm font-medium text-slate-600">
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-600">
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="address" className="text-sm font-medium text-slate-600">
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium text-slate-600">
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="state" className="text-sm font-medium text-slate-600">
                  State
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="NY"
                  value={shippingInfo.state}
                  onChange={handleShippingChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="zipCode" className="text-sm font-medium text-slate-600">
                  ZIP Code
                </label>
                <input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  placeholder="10001"
                  value={shippingInfo.zipCode}
                  onChange={handleShippingChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="country" className="text-sm font-medium text-slate-600">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleShippingChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
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
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-charcoal">Payment Information</h2>

            <div className="space-y-4">
              {/* Name on Card */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">
                  Name on Card
                </label>
                <input
                  type="text"
                  placeholder="As shown on card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Card Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Card Number</label>
                <div className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm">
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
                  <label className="text-sm font-medium text-slate-600">
                    Expiry Date
                  </label>
                  <div className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm">
                    <CardExpiryElement />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">
                    CVC
                  </label>
                  <div className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm">
                    <CardCvcElement />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Use Stripe test card 4242 4242 4242 4242, any future expiry, any CVC.
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <aside className="card space-y-4 self-start lg:sticky lg:top-4">
          <h2 className="text-lg font-semibold text-charcoal">Order Summary</h2>

          <div className="space-y-3">
            {cartItems.map((item) => {
              const itemTotal = item.product.price * item.quantity
              return (
                <div key={item.product.id} className="flex items-center gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-sm font-medium text-charcoal">
                      {item.product.name} {item.quantity > 1 && `× ${item.quantity}`}
                    </p>
                    <span className="text-xs text-slate-500">
                      ${item.product.price.toFixed(2)} each
                    </span>
                    <span className="text-xs font-medium text-primary">
                      ${itemTotal.toFixed(2)} total
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <hr />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Shipping</span>
              <span className="text-slate-400">Free</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Tax</span>
              <span>${(total * 0.1).toFixed(2)}</span>
            </div>
          </div>

          <hr />

          <div className="flex items-center justify-between text-base font-semibold text-charcoal">
            <span>Total</span>
            <span>${(total * 1.1).toFixed(2)}</span>
          </div>

          <button type="submit" disabled={isProcessing} className="btn-primary w-full">
            {isProcessing ? 'Processing...' : 'Place Order'}
          </button>

          <Link to="/cart" className="block text-center text-sm text-slate-500 hover:text-primary">
            ← Back to cart
          </Link>
        </aside>
      </form>
    </section>
  )
}

export default CheckoutPage

