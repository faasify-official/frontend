const mockProfile = {
  name: 'Avery Johnson',
  email: 'avery@faasify.com',
  role: 'Seller',
  bio: 'Building curated storefronts for boutique experiences.',
}

const ProfilePage = () => {
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
          <p className="text-lg font-medium text-charcoal">{mockProfile.name}</p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-600">Email</span>
          <p className="text-lg font-medium text-charcoal">{mockProfile.email}</p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-600">Account Type</span>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {mockProfile.role}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-600">About</span>
          <p className="text-sm text-slate-600">{mockProfile.bio}</p>
        </div>
      </div>
    </section>
  )
}

export default ProfilePage

