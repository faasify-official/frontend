import { Link, useLocation } from 'react-router-dom'
import { Minus, Plus, X, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '@hooks/useCart'

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart, total, updateQuantity } = useCart()
  const location = useLocation()
  const orderPlaced = location.state?.orderPlaced

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  return (
    <section className="space-y-8">
      {orderPlaced && (
        <div className="animate-fade-in-up rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-600" />
            Order placed successfully! Thank you for your purchase.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="animate-fade-in-up flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-charcoal">Shopping Cart</h1>
          <p className="mt-2 text-sm text-slate-500">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        {cartItems.length > 0 && (
          <button onClick={clearCart} className="btn-outline hover:text-red-500 hover:border-red-300 transition-colors">
            Clear Cart
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="animate-fade-in-up card flex flex-col items-center gap-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <ShoppingBag size={32} className="text-slate-400" />
          </div>
          <div>
            <p className="text-lg font-semibold text-charcoal">Your cart is empty</p>
            <p className="mt-1 text-sm text-slate-500">Add some items to get started!</p>
          </div>
          <Link to="/" className="btn-primary flex items-center gap-2">
            <ArrowLeft size={18} />
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Cart Items */}
          <div className="space-y-3">
            {cartItems.map((item, idx) => {
              const itemTotal = item.product.price * item.quantity
              return (
                <div
                  key={item.product.id}
                  className={`animate-stagger-${(idx % 6) + 1} card group hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center gap-4`}
                >
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-charcoal group-hover:text-primary transition-colors">
                      {item.product.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{item.product.category}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <span className="text-sm font-medium text-primary">
                        ${item.product.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-500">
                        Total: ${itemTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        className="rounded p-1.5 transition hover:bg-slate-100"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} className="text-slate-600" />
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-semibold text-charcoal">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        className="rounded p-1.5 transition hover:bg-slate-100"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} className="text-slate-600" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="animate-stagger-6 h-fit card space-y-4 sticky top-4">
            <h2 className="text-xl font-bold text-charcoal">Order Summary</h2>

            <div className="space-y-3 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-charcoal">${total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Shipping</span>
                <span className="text-xs font-medium text-primary">Free</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Tax</span>
                <span className="font-medium text-charcoal">${(total * 0.1).toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-charcoal">Total</span>
                <span className="text-2xl font-extrabold text-primary">
                  ${(total * 1.1).toFixed(2)}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="btn-primary w-full text-center font-semibold py-3 animate-button-hover block"
            >
              Proceed to Checkout
            </Link>

            <Link to="/" className="btn-outline w-full text-center font-semibold block">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}

export default CartPage

