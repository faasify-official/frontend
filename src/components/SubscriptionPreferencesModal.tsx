import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

type SubscriptionPreferences = {
  notifyEmail: boolean
  notifySms: boolean
  phoneNumber?: string
}

type SubscriptionPreferencesModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (preferences: SubscriptionPreferences) => void
  isLoading?: boolean
  // optional initial values if you want to reuse for “edit preferences” later
  initialValues?: Partial<SubscriptionPreferences>
}

const SubscriptionPreferencesModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  initialValues,
}: SubscriptionPreferencesModalProps) => {
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifySms, setNotifySms] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')

  // If we ever pass initialValues, sync them in
  useEffect(() => {
    if (initialValues) {
      if (typeof initialValues.notifyEmail === 'boolean') {
        setNotifyEmail(initialValues.notifyEmail)
      }
      if (typeof initialValues.notifySms === 'boolean') {
        setNotifySms(initialValues.notifySms)
      }
      if (initialValues.phoneNumber) {
        setPhoneNumber(initialValues.phoneNumber)
      }
    }
  }, [initialValues])

  if (!isOpen) return null

  const handleClose = () => {
    if (isLoading) return
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!notifyEmail && !notifySms) return
    if (notifySms && !phoneNumber.trim()) return

    onConfirm({
      notifyEmail,
      notifySms,
      phoneNumber: notifySms ? phoneNumber.trim() : undefined,
    })
  }

  const isSubmitDisabled =
    (!notifyEmail && !notifySms) || (notifySms && !phoneNumber.trim()) || isLoading

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-charcoal">
            Notification preferences
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <p className="text-sm text-slate-600">
            Choose how you want to receive updates when this storefront publishes
            new listings.
          </p>

          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
              />
              <span>Email</span>
            </label>

            <label className="flex items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300"
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
              />
              <div className="space-y-1">
                <span>SMS</span>
                <p className="text-xs text-slate-500">
                  Standard SMS rates may apply. Use full country code (e.g. +1 for
                  Canada/US).
                </p>
              </div>
            </label>
          </div>

          {notifySms && (
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium text-slate-600">
                Phone number <span className="text-red-500">*</span>
              </label>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 604 555 1234"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
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
              disabled={isSubmitDisabled}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SubscriptionPreferencesModal
