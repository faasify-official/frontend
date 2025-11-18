import { Link, NavLink } from 'react-router-dom'
import { ShoppingCart, Store } from 'lucide-react'
import { useMemo } from 'react'
import { useCart } from '@hooks/useCart'
import { useAuth } from '@context/AuthContext'


const Navbar = () => {
  const { cartCount } = useCart()
  const { user, isAuthenticated, logout, isSeller } = useAuth()
  const hasStorefront = user?.hasStorefront === true

  const navItems = useMemo(() => [
    { label: 'Home', to: '/' },
    { label: 'Stores', to: '/storefronts' },
    { label: 'Profile', to: '/profile' },
    { label: isSeller ? 'Orders' : 'Purchases', to: isSeller ? '/orders' : '/purchases' },
  ], [isSeller])

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
          {isAuthenticated && isSeller ? (
            hasStorefront ? (
              <Link to="/manage-storefront" className="btn-outline">
                <Store size={18} />
                <span className="hidden sm:inline ml-2">Manage Storefront</span>
              </Link>
            ) : (
              <Link to="/create-storefront" className="btn-outline">
                <Store size={18} />
                <span className="hidden sm:inline ml-2">Create Storefront</span>
              </Link>
            )
          ) : (
            <Link to="/cart" className="btn-outline relative">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-600 sm:inline">
                {user?.name}
                {user?.role === 'seller' && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Seller
                  </span>
                )}
              </span>
              <button onClick={logout} className="btn-outline text-sm">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-outline text-sm">
                Login
              </Link>
              <Link to="/create-account" className="btn-primary text-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
export default Navbar