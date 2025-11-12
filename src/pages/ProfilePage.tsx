import { useAuth } from '@context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

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

  // Capitalize role
  const formatRole = (role: string) => {
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
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-charcoal">Profile</h1>
        <p className="text-sm text-slate-500">
          Manage your personal details and understand your account role.
        </p>
      </div>

      <div className="card space-y-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-600">Name</span>
          <p className="text-lg font-medium text-charcoal">{user.name}</p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-600">Email</span>
          <p className="text-lg font-medium text-charcoal">{user.email}</p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-600">Account Type</span>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {formatRole(user.role)}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-600">User ID</span>
          <p className="text-sm font-mono text-slate-600">{user.userId}</p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-600">Member Since</span>
          <p className="text-sm text-slate-600">{formatDate(user.createdAt)}</p>
        </div>
      </div>
    </section>
  )
}

export default ProfilePage

