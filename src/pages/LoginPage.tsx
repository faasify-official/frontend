import { Link } from 'react-router-dom'

const LoginPage = () => {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-charcoal">Welcome back</h1>
        <p className="text-sm text-slate-500">Access your storefront dashboard with ease.</p>
      </div>

      <form className="card space-y-4">
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
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <button type="submit" className="btn-primary w-full">
          Login
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        New to FaaSify?{' '}
        <Link to="/create-account" className="font-semibold text-primary hover:text-primary-dark">
          Create Account
        </Link>
      </p>
    </section>
  )
}

export default LoginPage

