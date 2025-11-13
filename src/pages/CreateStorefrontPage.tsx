import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { apiPost } from '@utils/api'

const CreateStorefrontPage = () => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [image, setImage] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { isSeller, isLoading: authLoading, refreshProfile } = useAuth()
    const navigate = useNavigate()

    // Redirect if not a seller
    useEffect(() => {
        if (!authLoading && !isSeller) {
            navigate('/')
        }
    }, [isSeller, authLoading, navigate])

    if (authLoading) {
        return (
            <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
                <div className="card flex items-center justify-center py-12">
                    <p className="text-slate-500">Loading...</p>
                </div>
            </section>
        )
    }

    if (!isSeller) {
        return null // Will redirect in useEffect
    }

    const categories = [
        'Lifestyle',
        'Handmade',
        'Food & Beverage',
        'Electronics',
        'Fashion',
        'Home & Garden',
        'Sports & Outdoors',
        'Books & Media',
        'Other',
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!name || !description || !category) {
            setError('Please fill in all required fields')
            return
        }

        setIsLoading(true)

        try {
            await apiPost<{ storefront: { storeId: string } }>('/storefronts', {
                name,
                description,
                category,
                image: image || undefined,
            })

            // Refresh user profile to get updated hasStorefront flag
            await refreshProfile()

            // Navigate to manage storefront page
            navigate('/manage-storefront')
        } catch (err: any) {
            setError(err.message || 'Failed to create storefront. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-semibold text-charcoal">Create Your Storefront</h1>
                <p className="text-sm text-slate-500">
                    Set up your storefront to start selling your products to customers.
                </p>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="card space-y-6">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-slate-600">
                        Storefront Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="name"
                        type="text"
                        placeholder="My Awesome Store"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium text-slate-600">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="description"
                        placeholder="Describe what makes your storefront unique..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={4}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium text-slate-600">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="image" className="text-sm font-medium text-slate-600">
                        Storefront Image URL (Optional)
                    </label>
                    <input
                        id="image"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <p className="text-xs text-slate-500">
                        Leave empty to use a default image. You can update this later.
                    </p>
                </div>

                {image && (
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <img
                            src={image}
                            alt="Storefront preview"
                            className="h-48 w-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80'
                            }}
                        />
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn-outline flex-1"
                    >
                        Cancel
                    </button>
                    <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                        {isLoading ? 'Creating...' : 'Create Storefront'}
                    </button>
                </div>
            </form>
        </section>
    )
}

export default CreateStorefrontPage

