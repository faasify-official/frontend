import { Check, CheckCheck } from 'lucide-react'
import type { Message } from '../types/chat'

type Props = {
  message: Message
  isOwn: boolean
  showSenderName?: boolean
}

const MessageBubble = ({ message, isOwn, showSenderName = false }: Props) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
      <div className={`max-w-[70%] sm:max-w-[60%] flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
        {showSenderName && !isOwn && (
          <span className="text-xs font-medium text-slate-600 px-2">
            {message.senderName}
          </span>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            isOwn
              ? 'bg-gradient-to-br from-primary to-primary-dark text-white rounded-br-md'
              : 'bg-white border-2 border-slate-100 text-charcoal rounded-bl-md'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <div className={`flex items-center gap-1 px-2 text-xs text-slate-400 ${isOwn ? 'flex-row' : 'flex-row'}`}>
          <span>{formatTime(message.createdAt)}</span>
          {isOwn && (
            <span className="ml-1">
              {message.readAt ? (
                <CheckCheck size={14} className="text-primary" />
              ) : (
                <Check size={14} className="text-slate-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
