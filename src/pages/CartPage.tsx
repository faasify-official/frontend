import { Link } from 'react-router-dom'
import { useCart } from '@hooks/useCart'

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart, total } = useCart()

  return (
    <section className="space-y-8">
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
            {cartItems.map((item) => (
              <li key={item.id} className="card flex items-center gap-4">
                <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-sm font-semibold text-charcoal">{item.name}</p>
                  <span className="text-sm text-slate-500">${item.price.toFixed(2)}</span>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="btn-outline text-xs">
                  Remove
                </button>
              </li>
            ))}
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
            <button className="btn-primary w-full">Proceed to checkout</button>
          </aside>
        </div>
      )}
    </section>
  )
}

export default CartPage

