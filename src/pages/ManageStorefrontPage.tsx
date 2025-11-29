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
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const navigate = useNavigate()

  // Form state for adding/editing item
  const [itemName, setItemName] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [itemPrice, setItemPrice] = useState('')
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
    setItemImage('')
    setItemQuantity('')
    setEditingItem(null)
    setShowAddItemForm(false)
  }, [])

  const handleAddItem = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStorefront) return

    // Prevent submission if image is still uploading
    if (isUploadingImage) {
      setItemsError('Please wait for image upload to complete')
      return
    }

    setIsAddingItem(true)
    setItemsError(null)

    try {
      const payload = {
        name: itemName,
        description: itemDescription,
        price: parseFloat(itemPrice),
        category: 'General',
        image: itemImage || '',
        quantity: itemQuantity ? parseInt(itemQuantity, 10) : 0,
        storeId: selectedStorefront.storeId,
      }
      
      await apiPost<{ item: Product; message: string }>('/listings', payload)

      // Refresh items list to get the latest data from the database
      if (selectedStorefront) {
        await fetchItems(selectedStorefront.storeId)
      }
      resetForm()
    } catch (err) {
      console.error('Error adding item:', err)
      setItemsError(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setIsAddingItem(false)
    }
  }, [selectedStorefront, itemName, itemDescription, itemPrice, itemImage, itemQuantity, resetForm, isUploadingImage])

  const handleEditItem = useCallback((item: Product) => {
    setEditingItem(item)
    setItemName(item.name)
    setItemDescription(item.description)
    setItemPrice(item.price.toString())
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
        category: editingItem.category || 'General',
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
  }, [editingItem, itemName, itemDescription, itemPrice, itemImage, itemQuantity, resetForm])

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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Upload Image</label>
                  {/* <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                    
                      setIsUploadingImage(true);
                      setItemsError(null);
                    
                      try {
                        // Upload file to backend (server-side upload to S3 - avoids CORS issues)
                        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                        const token = localStorage.getItem('authTokens') 
                          ? JSON.parse(localStorage.getItem('authTokens')!).idToken 
                          : localStorage.getItem('authToken');
                        
                        const uploadResponse = await fetch(`${API_URL}/upload`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': file.type,
                            ...(token && { Authorization: `Bearer ${token}` }),
                          },
                          body: file,
                        });
                    
                        if (!uploadResponse.ok) {
                          const errorData = await uploadResponse.json().catch(() => ({ error: uploadResponse.statusText }));
                          console.error('Upload failed:', errorData);
                          throw new Error(errorData.error || `Failed to upload image: ${uploadResponse.status} ${uploadResponse.statusText}`);
                        }
                    
                        const result = await uploadResponse.json();
                        // Backend now returns S3 URL as primary (since CloudFront has 403 issues)
                        const imageUrl = result.imageUrl || result.s3Url;
                        
                        if (!imageUrl) {
                          throw new Error('Server did not return image URL');
                        }
                        
                        setItemImage(imageUrl);
                      } catch (err) {
                        console.error('Error uploading image:', err);
                        setItemsError(err instanceof Error ? err.message : 'Failed to upload image');
                        setItemImage(''); // Clear image on error
                      } finally {
                        setIsUploadingImage(false);
                      }
                    }}
                    disabled={isUploadingImage}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  /> */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      setIsUploadingImage(true);
                      setItemsError(null);

                      try {
                        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

                        const token = localStorage.getItem('authTokens')
                          ? JSON.parse(localStorage.getItem('authTokens')!).idToken
                          : localStorage.getItem('authToken');

                        // 🔥 Use FormData and field name "image"
                        const formData = new FormData();
                        formData.append('image', file); // MUST match upload.single('image')

                        const uploadResponse = await fetch(`${API_URL}/upload`, {
                          method: 'POST',
                          body: formData,
                          headers: {
                            ...(token && { Authorization: `Bearer ${token}` }),
                            // ⚠️ Do NOT set Content-Type – browser will set multipart boundary
                          },
                        });

                        if (!uploadResponse.ok) {
                          const errorData = await uploadResponse
                            .json()
                            .catch(() => ({ error: uploadResponse.statusText }));
                          console.error('Upload failed:', errorData);
                          throw new Error(
                            errorData.error ||
                              `Failed to upload image: ${uploadResponse.status} ${uploadResponse.statusText}`,
                          );
                        }

                        const result = await uploadResponse.json();
                        const imageUrl = result.imageUrl || result.s3Url;

                        if (!imageUrl) {
                          throw new Error('Server did not return image URL');
                        }

                        setItemImage(imageUrl);
                      } catch (err) {
                        console.error('Error uploading image:', err);
                        setItemsError(err instanceof Error ? err.message : 'Failed to upload image');
                        setItemImage(''); // Clear image on error
                      } finally {
                        setIsUploadingImage(false);
                      }
                    }}
                    disabled={isUploadingImage}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {isUploadingImage && (
                    <p className="text-sm text-slate-500">Uploading image...</p>
                  )}
                  {itemImage && (
                    <div className="mt-2">
                      <img
                        src={itemImage}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-xl border border-slate-200"
                      />
                      <p className="mt-1 text-xs text-green-600">✓ Image ready</p>
                      <p className="mt-1 text-xs text-slate-400 break-all">{itemImage.substring(0, 60)}...</p>
                    </div>
                  )}
                  {!itemImage && !isUploadingImage && (
                    <p className="text-xs text-slate-400 mt-1">No image selected. Item will use default image.</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={editingItem ? isUpdatingItem : isAddingItem || isUploadingImage}
                >
                  {isUploadingImage
                    ? 'Uploading Image...'
                    : editingItem
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
                {storefrontItems.map((item) => {
                  // Clean and validate image URL from database
                  const imageUrl = item.image?.trim() || '';
                  const defaultImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80';
                  
                  // Check if we have a CloudFront/S3 URL
                  const isCloudFrontUrl = imageUrl.includes('cloudfront.net');
                  const isS3Url = imageUrl.includes('s3.amazonaws.com') || imageUrl.includes('.s3.');
                  
                  // Generate S3 URL from CloudFront URL if needed (for fallback)
                  // Extract bucket name and region from CloudFront URL pattern
                  // CloudFront URL format: https://d1h5mef0qbip35.cloudfront.net/items/xxx.jpg
                  // S3 URL format: https://bucket-name.s3.region.amazonaws.com/items/xxx.jpg
                  let s3FallbackUrl = null;
                  if (isCloudFrontUrl && imageUrl.includes('/items/')) {
                    // Extract the key from CloudFront URL
                    const key = imageUrl.split('/items/')[1];
                    // Try to construct S3 URL - you'll need to set these in your env or get from API
                    // For now, we'll try a common pattern
                    const s3BucketName = import.meta.env.VITE_S3_BUCKET;
                    const awsRegion = import.meta.env.VITE_AWS_REGION;
                    if (key && s3BucketName && awsRegion) {
                      s3FallbackUrl = `https://${s3BucketName}.s3.${awsRegion}.amazonaws.com/items/${key}`;
                    }
                  }
                  
                  // Use CloudFront/S3 URL if available, otherwise use default
                  const finalImageUrl = ((isCloudFrontUrl || isS3Url) && imageUrl.length > 0) ? imageUrl : defaultImage;
                  
                  return (
                  <div key={item.id} className="card flex flex-col gap-3">
                    <div className="relative h-40 w-full overflow-hidden rounded-xl bg-slate-100">
                      <img
                        key={`${item.id}-${imageUrl}`} // Force re-render when URL changes
                        src={finalImageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          
                          // Try S3 URL if CloudFront failed
                          if (isCloudFrontUrl && s3FallbackUrl && target.src === imageUrl) {
                            target.src = s3FallbackUrl;
                            return;
                          }
                          
                          // If S3 also failed or no S3 fallback, use default
                          if ((isCloudFrontUrl || isS3Url) && !target.src.includes('unsplash.com')) {
                            setTimeout(() => {
                              if (!target.src.includes('unsplash.com')) {
                                target.src = defaultImage;
                              }
                            }, 1000);
                          }
                        }}
                      />
                    </div>
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
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default ManageStorefrontPage

