import { useState } from 'react'
import { X } from 'lucide-react'

type ShippingModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (carrier: string, trackingId: string) => void
  isLoading?: boolean
}

const ShippingModal = ({ isOpen, onClose, onConfirm, isLoading = false }: ShippingModalProps) => {
  const [carrier, setCarrier] = useState('')
  const [trackingId, setTrackingId] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (carrier.trim() && trackingId.trim()) {
      onConfirm(carrier.trim(), trackingId.trim())
      setCarrier('')
      setTrackingId('')
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setCarrier('')
      setTrackingId('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-fade-in-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-charcoal">Shipping Information</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="carrier" className="text-sm font-medium text-slate-600">
              Carrier <span className="text-red-500">*</span>
            </label>
            <input
              id="carrier"
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="e.g., FedEx, UPS, USPS"
              required
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="trackingId" className="text-sm font-medium text-slate-600">
              Tracking ID <span className="text-red-500">*</span>
            </label>
            <input
              id="trackingId"
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter tracking number"
              required
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="btn-outline flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !carrier.trim() || !trackingId.trim()}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Confirm Shipping'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ShippingModal

