import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

const options = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
]

const CreateAccountPage = () => {
  const [searchParams] = useSearchParams()
  const roleParam = searchParams.get('role')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'buyer' | 'seller'>(
    (roleParam === 'seller' ? 'seller' : 'buyer') as 'buyer' | 'seller'
  )
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  // Update role when query param changes
  useEffect(() => {
    if (roleParam === 'seller') {
      setRole('seller')
    } else if (roleParam === 'buyer') {
      setRole('buyer')
    }
  }, [roleParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)

    try {
      await register(name, email, password, role)
      // After successful registration, redirect to login page
      // User needs to log in to receive Cognito tokens
      navigate('/login', { state: { email, message: 'Account created! Please log in with your credentials.' } })
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-charcoal">Create your account</h1>
        <p className="text-sm text-slate-500">
          Choose your role and start building or shopping today.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-600">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-600">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-slate-600">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-slate-600">Account Type</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {options.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${role === option.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-200 hover:border-primary/60'
                  }`}
              >
                <input
                  type="radio"
                  value={option.value}
                  checked={role === option.value}
                  onChange={() => setRole(option.value as 'buyer' | 'seller')}
                  className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
          Login
        </Link>
      </p>
    </section>
  )
}

export default CreateAccountPage

