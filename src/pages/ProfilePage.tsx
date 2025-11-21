import { useAuth } from '@context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { User, Mail, Shield, Calendar } from 'lucide-react'

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, isLoading, navigate])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Capitalize role, handle undefined/null
  const formatRole = (role?: string) => {
    if (!role || typeof role !== 'string') return 'Unknown'
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  if (isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="card flex items-center justify-center py-12">
          <p className="text-slate-500">Loading profile...</p>
        </div>
      </section>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      {/* Header */}
      <div className="animate-fade-in-up flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold text-charcoal">Profile</h1>
        <p className="text-sm text-slate-500">
          Manage your personal details and understand your account role.
        </p>
      </div>

      {/* Profile Hero Card */}
      <div className="animate-stagger-1 card relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 p-8">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <User size={32} className="text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-charcoal">{user.name}</h2>
              <p className="text-sm text-slate-600">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-sm font-semibold text-primary">
              <Shield size={16} />
              {formatRole(user?.role)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-200/50 px-4 py-2 text-sm font-medium text-slate-700">
              <Calendar size={16} />
              Member since {formatDate(user.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Name Card */}
        <div className="animate-stagger-2 card group hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
              <User size={20} className="text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-slate-600">Full Name</span>
          </div>
          <p className="text-lg font-semibold text-charcoal">{user.name}</p>
        </div>

        {/* Email Card */}
        <div className="animate-stagger-3 card group hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
              <Mail size={20} className="text-green-600" />
            </div>
            <span className="text-sm font-semibold text-slate-600">Email Address</span>
          </div>
          <p className="text-lg font-semibold text-charcoal break-all">{user.email}</p>
        </div>

        {/* Account Type Card */}
        <div className="animate-stagger-4 card group hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
              <Shield size={20} className="text-purple-600" />
            </div>
            <span className="text-sm font-semibold text-slate-600">Account Type</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              {formatRole(user.role)}
            </span>
          </div>
        </div>

        {/* Member Since Card */}
        <div className="animate-stagger-5 card group hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors">
              <Calendar size={20} className="text-orange-600" />
            </div>
            <span className="text-sm font-semibold text-slate-600">Member Since</span>
          </div>
          <p className="text-lg font-semibold text-charcoal">{formatDate(user.createdAt)}</p>
        </div>
      </div>
    </section>
  )
}

export default ProfilePage

