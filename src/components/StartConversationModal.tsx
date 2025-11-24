import { useState } from 'react'
import { X, MessageCircle } from 'lucide-react'

type StartConversationModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (message: string) => void
  isLoading?: boolean
  sellerName?: string
  storeName?: string
}

const StartConversationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading = false,
  sellerName,
  storeName 
}: StartConversationModalProps) => {
  const [message, setMessage] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onConfirm(message.trim())
      setMessage('')
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setMessage('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 animate-fade-in-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
              <MessageCircle size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-charcoal">Start a Conversation</h2>
              {sellerName && (
                <p className="text-sm text-slate-500">
                  Message {sellerName}
                  {storeName && <span> about {storeName}</span>}
                </p>
              )}
            </div>
          </div>
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
            <label htmlFor="message" className="text-sm font-medium text-slate-600">
              Your Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'm interested in your products. Can you tell me more about..."
              required
              disabled={isLoading}
              rows={5}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
            <p className="text-xs text-slate-400">
              Write a brief message to introduce yourself and what you're looking for
            </p>
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
              disabled={isLoading || !message.trim()}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StartConversationModal
