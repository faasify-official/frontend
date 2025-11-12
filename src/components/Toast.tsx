import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useToast } from '@context/ToastContext'
import type { Toast as ToastType } from '@context/ToastContext'

const ToastItem = ({ toast }: { toast: ToastType }) => {
  const { removeToast } = useToast()

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }

  const styles = {
    success: 'border-green-200 bg-green-50 text-green-700',
    error: 'border-red-200 bg-red-50 text-red-700',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
  }

  const Icon = icons[toast.type]
  const styleClass = styles[toast.type]

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-4 shadow-lg transition-all ${styleClass}`}
    >
      <Icon size={20} className="flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 rounded-lg p-1 transition hover:bg-black/10"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  )
}

const ToastContainer = () => {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

export default ToastContainer

