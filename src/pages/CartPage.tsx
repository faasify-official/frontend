import { Link, useLocation } from 'react-router-dom'
import { Minus, Plus, X } from 'lucide-react'
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
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Order placed successfully! Thank you for your purchase.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-charcoal">Your cart</h1>
          <p className="text-sm text-slate-500">Review and manage the items you plan to purchase.</p>
        </div>
        {cartItems.length > 0 && (
          <button onClick={clearCart} className="btn-outline">
            Clear Cart
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 text-center">
          <p className="text-lg font-medium text-charcoal">Your cart is empty.</p>
          <Link to="/" className="btn-primary">
            Browse storefronts
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <ul className="space-y-4">
            {cartItems.map((item) => {
              const itemTotal = item.product.price * item.quantity
              return (
                <li key={item.product.id} className="card flex items-center gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-sm font-semibold text-charcoal">{item.product.name}</p>
                    <span className="text-sm text-slate-500">
                      ${item.product.price.toFixed(2)} each
                    </span>
                    <span className="text-xs font-medium text-primary">
                      ${itemTotal.toFixed(2)} total
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200">
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        className="p-2 transition hover:bg-slate-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} className="text-slate-600" />
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-semibold text-charcoal">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        className="p-2 transition hover:bg-slate-50"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} className="text-slate-600" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="btn-outline text-xs"
                      aria-label="Remove item"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          <aside className="card space-y-4">
            <h2 className="text-lg font-semibold text-charcoal">Order summary</h2>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Shipping</span>
              <span className="text-slate-400">Calculated at checkout</span>
            </div>
            <hr />
            <div className="flex items-center justify-between text-base font-semibold text-charcoal">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="btn-primary w-full text-center">
              Proceed to checkout
            </Link>
          </aside>
        </div>
      )}
    </section>
  )
}

export default CartPage

