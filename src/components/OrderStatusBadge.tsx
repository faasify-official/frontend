import { CheckCircle, Package, Truck, Home } from 'lucide-react'

type OrderStatusBadgeProps = {
  status: string
  isSeller?: boolean
  carrier?: string | null
  trackingId?: string | null
}

const OrderStatusBadge = ({ status, isSeller = false, carrier, trackingId }: OrderStatusBadgeProps) => {
  // Buyer statuses
  const buyerStatuses = {
    'ORDER_CONFIRMED': { label: 'Order Confirmed', icon: CheckCircle, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    'SHIPPED': { label: 'Shipped', icon: Truck, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    'DELIVERED': { label: 'Delivered', icon: Home, color: 'bg-green-50 text-green-700 border-green-200' },
    'COMPLETED': { label: 'Completed', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  }

  // Seller statuses
  const sellerStatuses = {
    'PREPARE_ORDER': { label: 'Prepare Order', icon: Package, color: 'bg-orange-50 text-orange-700 border-orange-200' },
    'SHIPPED': { label: 'Shipped', icon: Truck, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    'DELIVERED': { label: 'Delivered', icon: Home, color: 'bg-green-50 text-green-700 border-green-200' },
    'COMPLETED': { label: 'Completed', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  }

  const statusConfig = isSeller 
    ? sellerStatuses[status as keyof typeof sellerStatuses] 
    : buyerStatuses[status as keyof typeof buyerStatuses]
  
  // Fallback for unknown statuses
  if (!statusConfig) {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border bg-slate-50 text-slate-700 border-slate-200">
        {status}
      </span>
    )
  }

  const Icon = statusConfig.icon

  return (
    <div className="flex flex-col gap-2">
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
        <Icon size={14} />
        {statusConfig.label}
      </span>
      {status === 'SHIPPED' && carrier && trackingId && (
        <div className="text-xs text-slate-600 mt-1">
          <div className="font-medium">Carrier: {carrier}</div>
          <div className="font-mono">Tracking: {trackingId}</div>
        </div>
      )}
    </div>
  )
}

export default OrderStatusBadge

