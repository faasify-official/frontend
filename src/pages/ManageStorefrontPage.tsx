import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { useStorefronts } from '@hooks/useStorefronts'
import type { Storefront } from '../types/storefront'
import type { Product } from '../types/product'
import { apiGet, apiPost, apiPut, apiDelete } from '@utils/api'

const ManageStorefrontPage = () => {
  const { isSeller, isLoading: authLoading } = useAuth()
  const { storefronts, isLoading: storefrontsLoading, error, refetch } = useStorefronts()
  const [selectedStorefront, setSelectedStorefront] = useState<Storefront | null>(null)
  const [storefrontItems, setStorefrontItems] = useState<Product[]>([])
  const [showAddItemForm, setShowAddItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Product | null>(null)
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isUpdatingItem, setIsUpdatingItem] = useState(false)
  const [isDeletingItem, setIsDeletingItem] = useState<string | null>(null)
  const [itemsError, setItemsError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Form state for adding/editing item
  const [itemName, setItemName] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [itemCategory, setItemCategory] = useState('')
  const [itemImage, setItemImage] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')

  // Memoize the first storefront to avoid unnecessary re-renders
  const firstStorefront = useMemo(() => storefronts[0] || null, [storefronts])

  // Fetch items function - memoized to avoid recreating on every render
  const fetchItems = useCallback(async (storeId: string) => {
    setIsLoadingItems(true)
    setItemsError(null)
    try {
      const response = await apiGet<{ items: Product[] }>(`/listings?storeId=${storeId}`)
      setStorefrontItems(response.items || [])
    } catch (err) {
      console.error('Error fetching items:', err)
      setItemsError(err instanceof Error ? err.message : 'Failed to load items')
      setStorefrontItems([])
    } finally {
      setIsLoadingItems(false)
    }
  }, [])

  // Redirect if not a seller
  useEffect(() => {
    if (!authLoading && !isSeller) {
      navigate('/')
    }
  }, [isSeller, authLoading, navigate])

  // Select first storefront when storefronts load
  useEffect(() => {
    if (!storefrontsLoading && firstStorefront && !selectedStorefront) {
      setSelectedStorefront(firstStorefront)
    }
  }, [storefrontsLoading, firstStorefront, selectedStorefront])

  // Fetch items whenever selected storefront changes
  useEffect(() => {
    if (selectedStorefront) {
      fetchItems(selectedStorefront.storeId)
    }
  }, [selectedStorefront, fetchItems])

  const resetForm = useCallback(() => {
    setItemName('')
    setItemDescription('')
    setItemPrice('')
    setItemCategory('')
    setItemImage('')
    setItemQuantity('')
    setEditingItem(null)
    setShowAddItemForm(false)
  }, [])

  const handleAddItem = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStorefront) return

    setIsAddingItem(true)
    setItemsError(null)

    try {
      const response = await apiPost<{ item: Product; message: string }>('/listings', {
        name: itemName,
        description: itemDescription,
        price: parseFloat(itemPrice),
        category: itemCategory,
        image: itemImage || '',
        quantity: itemQuantity ? parseInt(itemQuantity, 10) : 0,
        storeId: selectedStorefront.storeId,
      })

      // Add the new item to the list
      setStorefrontItems((prevItems) => [...prevItems, response.item])
      resetForm()
    } catch (err) {
      console.error('Error adding item:', err)
      setItemsError(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setIsAddingItem(false)
    }
  }, [selectedStorefront, itemName, itemDescription, itemPrice, itemCategory, itemImage, itemQuantity, resetForm])

  const handleEditItem = useCallback((item: Product) => {
    setEditingItem(item)
    setItemName(item.name)
    setItemDescription(item.description)
    setItemPrice(item.price.toString())
    setItemCategory(item.category)
    setItemImage(item.image)
    setItemQuantity((item.quantity || 0).toString())
    setShowAddItemForm(false)
  }, [])

  const handleUpdateItem = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    setIsUpdatingItem(true)
    setItemsError(null)

    try {
      const response = await apiPut<{ item: Product; message: string }>(`/listings/${editingItem.id}`, {
        name: itemName,
        description: itemDescription,
        price: parseFloat(itemPrice),
        category: itemCategory,
        image: itemImage || '',
        quantity: itemQuantity ? parseInt(itemQuantity, 10) : 0,
      })

      // Update the item in the list
      setStorefrontItems((prevItems) =>
        prevItems.map((item) => (item.id === editingItem.id ? response.item : item))
      )
      resetForm()
    } catch (err) {
      console.error('Error updating item:', err)
      setItemsError(err instanceof Error ? err.message : 'Failed to update item')
    } finally {
      setIsUpdatingItem(false)
    }
  }, [editingItem, itemName, itemDescription, itemPrice, itemCategory, itemImage, itemQuantity, resetForm])

  const handleDeleteItem = useCallback(async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return
    }

    setIsDeletingItem(itemId)
    setItemsError(null)

    try {
      await apiDelete<{ message: string }>(`/listings/${itemId}`)
      // Remove the item from the list
      setStorefrontItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
    } catch (err) {
      console.error('Error deleting item:', err)
      setItemsError(err instanceof Error ? err.message : 'Failed to delete item')
    } finally {
      setIsDeletingItem(null)
    }
  }, [])

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
              if (storefront) {
                setSelectedStorefront(storefront)
              }
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
              {!editingItem && (
                <button
                  onClick={() => {
                    resetForm()
                    setShowAddItemForm(!showAddItemForm)
                  }}
                  className="btn-primary text-sm"
                  disabled={isLoadingItems}
                >
                  {showAddItemForm ? 'Cancel' : '+ Add Item'}
                </button>
              )}
            </div>

            {/* Error message */}
            {itemsError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {itemsError}
              </div>
            )}

            {/* Add/Edit Item Form */}
            {(showAddItemForm || editingItem) && (
              <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-charcoal">
                    {editingItem ? 'Edit Item' : 'Add New Item'}
                  </h3>
                  {editingItem && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-sm text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
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
                    <label className="text-sm font-medium text-slate-600">Quantity</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="0"
                    />
                  </div>
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
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={editingItem ? isUpdatingItem : isAddingItem}
                >
                  {editingItem
                    ? isUpdatingItem
                      ? 'Updating...'
                      : 'Update Item'
                    : isAddingItem
                      ? 'Adding...'
                      : 'Add Item'}
                </button>
              </form>
            )}

            {/* Items List */}
            {isLoadingItems ? (
              <div className="card flex items-center justify-center py-12">
                <p className="text-slate-500">Loading items...</p>
              </div>
            ) : storefrontItems.length === 0 ? (
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
                      {item.quantity !== undefined && (
                        <p className="mt-1 text-sm text-slate-600">
                          Quantity: {item.quantity}
                        </p>
                      )}
                    </div>
                    <p className="flex-1 text-sm text-slate-600 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="btn-outline flex-1 text-sm"
                        disabled={!!editingItem || isDeletingItem === item.id}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="btn-outline flex-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                        disabled={!!editingItem || isDeletingItem === item.id}
                      >
                        {isDeletingItem === item.id ? 'Deleting...' : 'Delete'}
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

