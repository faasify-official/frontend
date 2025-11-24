import { Link } from 'react-router-dom'
import { MessageCircle, Store, Clock } from 'lucide-react'
import type { Chat } from '../types/chat'

type Props = {
  chat: Chat
  currentUserId?: string
}

const ChatListItem = ({ chat, currentUserId }: Props) => {
  // Get the other participant's name (the person you're chatting with)
  const otherParticipantIndex = chat.participants.findIndex(id => id !== currentUserId)
  const otherParticipantName = chat.participantNames[otherParticipantIndex] || 'Unknown User'

  // Format the last message time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      // Today - show time
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    } else if (diffInDays === 1) {
      return 'Yesterday'
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const hasUnread = (chat.unreadCount ?? 0) > 0

  return (
    <Link
      to={`/chat/${chat.id}`}
      className={`group card hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 ${
        hasUnread ? 'border-l-4 border-l-primary' : ''
      }`}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Avatar/Icon */}
        <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
          hasUnread 
            ? 'bg-gradient-to-br from-primary to-primary-dark' 
            : 'bg-gradient-to-br from-slate-100 to-slate-200'
        } transition-all duration-300`}>
          <MessageCircle 
            size={24} 
            className={hasUnread ? 'text-white' : 'text-slate-400'}
          />
        </div>

        {/* Chat Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-semibold truncate ${
                hasUnread ? 'text-charcoal' : 'text-slate-700'
              } group-hover:text-primary transition-colors`}>
                {otherParticipantName}
              </h3>
              
              {chat.storeName && (
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                  <Store size={12} />
                  <span className="truncate">{chat.storeName}</span>
                </div>
              )}
            </div>

            {chat.lastMessage && (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={12} />
                  <span>{formatTime(chat.lastMessage.createdAt)}</span>
                </div>
                {hasUnread && (
                  <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-white text-xs font-bold">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Last Message Preview */}
          {chat.lastMessage && (
            <p className={`mt-2 text-sm truncate ${
              hasUnread ? 'text-charcoal font-medium' : 'text-slate-500'
            }`}>
              {chat.lastMessage.senderId === currentUserId && (
                <span className="text-slate-400">You: </span>
              )}
              {chat.lastMessage.content}
            </p>
          )}

          {!chat.lastMessage && (
            <p className="mt-2 text-sm text-slate-400 italic">No messages yet</p>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ChatListItem
