import { useState } from 'react'
import { Link } from 'react-router-dom'

const options = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
]

const CreateAccountPage = () => {
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer')

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-charcoal">Create your account</h1>
        <p className="text-sm text-slate-500">
          Choose your role and start building or shopping today.
        </p>
      </div>

      <form className="card space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-600">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Jane Doe"
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
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-slate-600">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Create a strong password"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-slate-600">Account Type</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {options.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  role === option.value
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

        <button type="submit" className="btn-primary w-full">
          Create Account
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

