import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { useStorefronts } from '@hooks/useStorefronts'
import { apiGet, apiPut } from '@utils/api'
import OrderStatusBadge from '@components/OrderStatusBadge'
import ShippingModal from '@components/ShippingModal'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'

type Order = {
  id: string
  userId: string
  items: {
    itemId: string
    name: string
    image?: string
    price: number
    quantity?: number
  }[]
  total: number
  status: string
  orderStatus: string
  carrier?: string | null
  trackingId?: string | null
  shippingInfo?: {
    name: string
    address: string
    city: string
    state: string
    zip: string
    country: string
  }
  createdAt: string
  storeId: string
}

const SellerOrdersPage = () => {
  const { isSeller, isLoading: authLoading } = useAuth()
  const { storefronts, isLoading: storefrontsLoading } = useStorefronts()
  const navigate = useNavigate()
  const [selectedStorefrontId, setSelectedStorefrontId] = useState<string>('')
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [shippingModal, setShippingModal] = useState<{ isOpen: boolean; orderId: string | null }>({
    isOpen: false,
    orderId: null,
  })
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null)

  // Set first storefront as default
  useEffect(() => {
    if (!storefrontsLoading && storefronts.length > 0 && !selectedStorefrontId) {
      const firstStorefrontId = storefronts[0].storeId
      console.log('Setting default storefront:', firstStorefrontId)
      setSelectedStorefrontId(firstStorefrontId)
    }
  }, [storefronts, storefrontsLoading, selectedStorefrontId])

  // Fetch orders for selected storefront
  useEffect(() => {
    if (!selectedStorefrontId || !isSeller) return

    const fetchOrders = async () => {
      setIsLoading(true)
      setError(null)
      try {
        console.log('Fetching orders for storefront:', selectedStorefrontId)
        const data = await apiGet<{ orders: Order[] }>(`/orders/storefront/${selectedStorefrontId}`)
        console.log('Orders received:', data)
        // Sort by creation date, newest first
        const sortedOrders = (data.orders || []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        console.log('Sorted orders:', sortedOrders)
        setOrders(sortedOrders)
      } catch (err) {
        console.error('Error fetching orders:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to load orders'
        console.error('Error details:', errorMessage)
        setError(errorMessage)
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [selectedStorefrontId, isSeller])

  // Redirect if not seller
  useEffect(() => {
    if (!authLoading && !isSeller) {
      navigate('/')
    }
  }, [isSeller, authLoading, navigate])

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string, carrier?: string, trackingId?: string) => {
    setIsUpdatingStatus(orderId)
    try {
      await apiPut(`/orders/${orderId}/status`, {
        status: newStatus,
        ...(carrier && { carrier }),
        ...(trackingId && { trackingId }),
      })

      // Map seller status to buyer status
      const statusMap: Record<string, string> = {
        'PREPARE_ORDER': 'ORDER_CONFIRMED',
        'SHIPPED': 'SHIPPED',
        'DELIVERED': 'DELIVERED',
        'COMPLETED': 'COMPLETED'
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                orderStatus: newStatus,
                status: statusMap[newStatus] || 'ORDER_CONFIRMED',
                ...(carrier && { carrier }),
                ...(trackingId && { trackingId }),
              }
            : order
        )
      )

      setShippingModal({ isOpen: false, orderId: null })
    } catch (err) {
      console.error('Error updating order status:', err)
      alert(err instanceof Error ? err.message : 'Failed to update order status')
    } finally {
      setIsUpdatingStatus(null)
    }
  }

  const handleStatusChange = (orderId: string, currentStatus: string) => {
    const statusFlow = ['PREPARE_ORDER', 'SHIPPED', 'DELIVERED', 'COMPLETED']
    const currentIndex = statusFlow.indexOf(currentStatus)
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) return

    const nextStatus = statusFlow[currentIndex + 1]

    // If moving to SHIPPED, show modal
    if (nextStatus === 'SHIPPED') {
      setShippingModal({ isOpen: true, orderId })
    } else {
      handleStatusUpdate(orderId, nextStatus)
    }
  }

  const handleShippingConfirm = (carrier: string, trackingId: string) => {
    if (shippingModal.orderId) {
      handleStatusUpdate(shippingModal.orderId, 'SHIPPED', carrier, trackingId)
    }
  }

  if (authLoading || storefrontsLoading) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <div className="card flex items-center justify-center py-12">
          <p className="text-slate-500">Loading...</p>
        </div>
      </section>
    )
  }

  if (!isSeller) {
    return null
  }

  if (storefronts.length === 0) {
    return (
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-8">
        <div className="card flex flex-col items-center justify-center gap-4 py-12 text-center">
          <p className="text-slate-600">You don't have any storefronts yet.</p>
          <button onClick={() => navigate('/create-storefront')} className="btn-primary">
            Create Your First Storefront
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-charcoal">Manage Orders</h1>
        <p className="text-sm text-slate-500">View and update order statuses for your storefronts.</p>
      </div>

      {/* Storefront Selector */}
      {storefronts.length > 1 && (
        <div className="card">
          <label className="text-sm font-medium text-slate-600 mb-2 block">Select Storefront</label>
          <select
            value={selectedStorefrontId}
            onChange={(e) => setSelectedStorefrontId(e.target.value)}
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

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Orders List */}
      {isLoading ? (
        <div className="card flex items-center justify-center py-12">
          <p className="text-slate-500">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-4 py-12 text-center">
          <Package size={48} className="text-slate-400" />
          <div>
            <p className="text-lg font-semibold text-charcoal">No orders yet</p>
            <p className="mt-1 text-sm text-slate-500">Orders will appear here when customers make purchases.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrders.has(order.id)
            // Default to PREPARE_ORDER if orderStatus doesn't exist (for old orders)
            const currentOrderStatus = order.orderStatus || order.status || 'PREPARE_ORDER'
            // Map old statuses to new ones
            const normalizedStatus = currentOrderStatus === 'PAID' ? 'PREPARE_ORDER' : currentOrderStatus
            const statusFlow = ['PREPARE_ORDER', 'SHIPPED', 'DELIVERED', 'COMPLETED']
            const currentIndex = statusFlow.indexOf(normalizedStatus)
            const canUpdate = currentIndex < statusFlow.length - 1

            return (
              <div key={order.id} className="card">
                <div className="flex flex-col gap-4">
                  {/* Order Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-charcoal">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                        <OrderStatusBadge status={normalizedStatus} isSeller={true} carrier={order.carrier} trackingId={order.trackingId} />
                      </div>
                      <p className="text-sm text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-lg font-bold text-primary mt-2">${(order.total / 100).toFixed(2)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="btn-outline text-sm flex items-center gap-2"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={16} />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown size={16} />
                            View Details
                          </>
                        )}
                      </button>
                      {canUpdate && (
                        <button
                          onClick={() => handleStatusChange(order.id, normalizedStatus)}
                          disabled={isUpdatingStatus === order.id}
                          className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdatingStatus === order.id
                            ? 'Updating...'
                            : currentIndex === 0
                            ? 'Mark as Shipped'
                            : currentIndex === 1
                            ? 'Mark as Delivered'
                            : 'Mark as Completed'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 pt-4 space-y-4 animate-fade-in">
                      {/* Items */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                              {item.image && (
                                <img src={item.image} alt={item.name} className="h-12 w-12 rounded object-cover" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-charcoal">{item.name}</p>
                                <p className="text-xs text-slate-500">
                                  ${item.price.toFixed(2)} {item.quantity && `× ${item.quantity}`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Info */}
                      {order.shippingInfo && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-2">Shipping Address</h4>
                          <div className="p-3 rounded-lg bg-slate-50 text-sm text-slate-700">
                            <p className="font-medium">{order.shippingInfo.name}</p>
                            <p>{order.shippingInfo.address}</p>
                            <p>
                              {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zip}
                            </p>
                            <p>{order.shippingInfo.country}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Shipping Modal */}
      <ShippingModal
        isOpen={shippingModal.isOpen}
        onClose={() => setShippingModal({ isOpen: false, orderId: null })}
        onConfirm={handleShippingConfirm}
        isLoading={isUpdatingStatus !== null}
      />
    </section>
  )
}

export default SellerOrdersPage

