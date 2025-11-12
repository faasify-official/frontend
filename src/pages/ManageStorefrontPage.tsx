import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { useStorefronts } from '@hooks/useStorefronts'
import type { Storefront } from '../types/storefront'
import type { Product } from '../types/product'
import { products } from '@data/products'

const ManageStorefrontPage = () => {
  const { isSeller, isLoading: authLoading } = useAuth()
  const { storefronts, isLoading: storefrontsLoading, error, refetch } = useStorefronts()
  const [selectedStorefront, setSelectedStorefront] = useState<Storefront | null>(null)
  const [storefrontItems, setStorefrontItems] = useState<Product[]>([])
  const [showAddItemForm, setShowAddItemForm] = useState(false)
  const navigate = useNavigate()

  // Form state for adding new item
  const [itemName, setItemName] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [itemCategory, setItemCategory] = useState('')
  const [itemImage, setItemImage] = useState('')

  // Redirect if not a seller
  useEffect(() => {
    if (!authLoading && !isSeller) {
      navigate('/')
    }
  }, [isSeller, authLoading, navigate])

  // Select first storefront by default
  useEffect(() => {
    if (storefronts.length > 0 && !selectedStorefront) {
      setSelectedStorefront(storefronts[0])
    }
  }, [storefronts, selectedStorefront])

  // Load items for selected storefront
  useEffect(() => {
    if (selectedStorefront) {
      // TODO: Replace with API call to fetch items for this storefront
      // For now, use mock data - filter products that match the storefront's items array
      const items = selectedStorefront.items
        .map((productId) => products.find((p) => p.id === productId))
        .filter((product): product is Product => product !== undefined)
      setStorefrontItems(items)
    }
  }, [selectedStorefront])

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Replace with API call to add item to storefront
    // For now, just add to local state
    const newItem: Product = {
      id: `item-${Date.now()}`,
      name: itemName,
      description: itemDescription,
      price: parseFloat(itemPrice),
      category: itemCategory,
      image: itemImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
      averageRating: 0,
      reviews: [],
    }

    setStorefrontItems([...storefrontItems, newItem])
    setShowAddItemForm(false)
    // Reset form
    setItemName('')
    setItemDescription('')
    setItemPrice('')
    setItemCategory('')
    setItemImage('')
  }

  if (authLoading || storefrontsLoading) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="card flex items-center justify-center py-12">
          <p className="text-slate-500">Loading...</p>
        </div>
      </section>
    )
  }

  if (!isSeller) {
    return null // Will redirect in useEffect
  }

  if (!storefrontsLoading && storefronts.length === 0) {
    return (
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="card flex flex-col items-center justify-center gap-4 py-12 text-center">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-4">
              Error: {error}
            </div>
          )}
          <p className="text-slate-600">You don't have any storefronts yet.</p>
          <div className="flex gap-3">
            <button onClick={() => refetch()} className="btn-outline">
              Retry
            </button>
            <button onClick={() => navigate('/create-storefront')} className="btn-primary">
              Create Your First Storefront
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-charcoal">Manage Storefront</h1>
        <p className="text-sm text-slate-500">View and manage your storefront items.</p>
      </div>

      {/* Storefront Selector */}
      {storefronts.length > 1 && (
        <div className="card">
          <label className="text-sm font-medium text-slate-600 mb-2 block">
            Select Storefront
          </label>
          <select
            value={selectedStorefront?.storeId || ''}
            onChange={(e) => {
              const storefront = storefronts.find((s) => s.storeId === e.target.value)
              setSelectedStorefront(storefront || null)
            }}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {storefronts.map((sf) => (
              <option key={sf.storeId} value={sf.storeId}>
                {sf.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedStorefront && (
        <>
          {/* Storefront Info */}
          <div className="card space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-charcoal">{selectedStorefront.name}</h2>
              <p className="mt-1 text-sm text-slate-600">{selectedStorefront.description}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                <span>Category: {selectedStorefront.category}</span>
                <span>•</span>
                <span>{storefrontItems.length} items</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/storefront/${selectedStorefront.storeId}`}
                className="btn-outline text-sm"
              >
                View Public Storefront
              </Link>
            </div>
          </div>

          {/* Items Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-charcoal">Items</h2>
              <button
                onClick={() => setShowAddItemForm(!showAddItemForm)}
                className="btn-primary text-sm"
              >
                {showAddItemForm ? 'Cancel' : '+ Add Item'}
              </button>
            </div>

            {/* Add Item Form */}
            {showAddItemForm && (
              <form onSubmit={handleAddItem} className="card space-y-4">
                <h3 className="text-lg font-semibold text-charcoal">Add New Item</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    required
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Image URL</label>
                    <input
                      type="url"
                      value={itemImage}
                      onChange={(e) => setItemImage(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full">
                  Add Item
                </button>
              </form>
            )}

            {/* Items List */}
            {storefrontItems.length === 0 ? (
              <div className="card flex items-center justify-center py-12">
                <p className="text-slate-500">No items yet. Add your first item to get started!</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {storefrontItems.map((item) => (
                  <div key={item.id} className="card flex flex-col gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-40 w-full rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-charcoal">{item.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{item.category}</p>
                      <p className="mt-2 text-lg font-bold text-primary">${item.price.toFixed(2)}</p>
                    </div>
                    <p className="flex-1 text-sm text-slate-600 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex gap-2">
                      <button className="btn-outline flex-1 text-sm">Edit</button>
                      <button className="btn-outline flex-1 text-sm text-red-600 hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default ManageStorefrontPage

