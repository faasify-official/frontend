import { Link, NavLink } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@hooks/useCart'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Cart', to: '/cart' },
  { label: 'Profile', to: '/profile' },
]

const Navbar = () => {
  const { cartCount } = useCart()

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-primary">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingCart size={20} strokeWidth={2.5} />
          </span>
          FaaSify
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 sm:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `transition hover:text-primary ${isActive ? 'text-primary' : ''}`
              }
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/cart" className="btn-outline relative">
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Navbar

