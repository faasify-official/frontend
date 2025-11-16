import { Link, NavLink, useMatch } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@hooks/useCart'
import { useAuth } from '@context/AuthContext'
import SearchBar from '@components/SearchBar'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Profile', to: '/profile' },
  { label: 'Purchases', to: '/purchases' },

]

const Navbar = () => {
  const { cartCount } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const cartMatch = useMatch('/cart')
  const cartPageActiveBtnClass = `inline-flex items-center justify-center rounded-full border ${cartMatch ? 'border-primary' : 'border-slate-300'} px-4 py-2 text-sm font-semibold ${cartMatch ? 'text-primary' : 'text-slate-700'} transition hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary relative transition`

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:px-8 lg:px-12">
        <div className="flex w-full flex-wrap items-center gap-4">
          <div className="flex flex-1 items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-primary">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShoppingCart size={20} strokeWidth={2.5} />
              </span>
              FaaSify
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 lg:flex">
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
          </div>
          <div className="hidden flex-1 justify-center lg:flex">
            <SearchBar />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/cart" className={cartPageActiveBtnClass}>
              <ShoppingCart size={18} color="currentColor" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
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
        <div className="w-full lg:hidden">
          <SearchBar />
        </div>
      </div>
    </header>
  )
}
export default Navbar