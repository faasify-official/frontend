import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, ArrowLeft, Search } from 'lucide-react'
import ChatListItem from '@components/ChatListItem'
import { apiGet } from '@utils/api'
import { useAuth } from '@context/AuthContext'
import { useChatWebSocket } from '@hooks/useChatWebSocket'
import type { Chat } from '../types/chat'

const ChatListPage = () => {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const { user } = useAuth()
  const { subscribeToNewChats, subscribeToUserPresence, isConnected } = useChatWebSocket()

  useEffect(() => {
    const fetchChats = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiGet<{ chats: Chat[] }>('/chats')
        console.log(data)
        setChats(data.chats || [])
      } catch (err: any) {
        setError(err.message || 'Failed to fetch chats')
        setChats([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchChats()
  }, [])

  // Subscribe to new chat notifications via WebSocket
  useEffect(() => {
    if (!isConnected) return

    const unsubscribe = subscribeToNewChats(async (chatId: string) => {
      try {
        // Fetch the new chat details
        const data = await apiGet<{ chat: Chat }>(`/chats/${chatId}`)
        
        setChats((prev) => {
          // Check if chat already exists
          const exists = prev.some(chat => chat.id === chatId)
          if (exists) return prev
          
          // Add new chat to the top of the list
          return [data.chat, ...prev]
        })
      } catch (err) {
        console.error('Error fetching new chat:', err)
      }
    })

    return unsubscribe
  }, [isConnected, subscribeToNewChats])

  // Subscribe to user presence (online/offline) via WebSocket
  useEffect(() => {
    if (!isConnected) return

    const unsubscribe = subscribeToUserPresence((userId: string, online: boolean) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev)
        if (online) {
          updated.add(userId)
        } else {
          updated.delete(userId)
        }
        return updated
      })
    })

    return unsubscribe
  }, [isConnected, subscribeToUserPresence])

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) {
      return chats
    }

    const normalizedQuery = searchQuery.toLowerCase().trim()
    return chats.filter((chat) => {
      // Search by participant names
      const participantMatch = chat.participantNames.some(name => 
        name.toLowerCase().includes(normalizedQuery)
      )
      
      // Search by store name
      const storeMatch = chat.storeName?.toLowerCase().includes(normalizedQuery)
      
      // Search by last message content
      const messageMatch = chat.lastMessage?.content.toLowerCase().includes(normalizedQuery)

      return participantMatch || storeMatch || messageMatch
    })
  }, [chats, searchQuery])

  // Sort chats by last message time (most recent first)
  const sortedChats = useMemo(() => {
    return [...filteredChats].sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.updatedAt
      const bTime = b.lastMessage?.createdAt || b.updatedAt
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })
  }, [filteredChats])

  // Separate unread and read chats
  const unreadChats = sortedChats.filter(chat => (chat.unreadCount ?? 0) > 0)
  const readChats = sortedChats.filter(chat => (chat.unreadCount ?? 0) === 0)

  return (
    <section className="flex flex-col gap-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="rounded-xl bg-gradient-to-r from-primary/6 to-transparent p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-extrabold text-charcoal">Messages</h1>
                {isConnected && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600">
                    <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                    <span className="hidden sm:inline">Live</span>
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {chats.length === 0
                  ? 'Your conversations will appear here'
                  : `You have ${chats.length} conversation${chats.length !== 1 ? 's' : ''}`}
                {unreadChats.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-white text-xs font-bold">
                    {unreadChats.length}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {chats.length > 0 && (
        <div className="animate-stagger-1">
          <div className="relative">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" 
              size={20} 
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-500">Loading conversations...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="animate-fade-in rounded-xl bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-semibold text-red-700">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && chats.length === 0 && (
        <div className="animate-fade-in-up card flex flex-col items-center gap-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <MessageCircle size={32} className="text-slate-400" />
          </div>
          <div>
            <p className="text-lg font-semibold text-charcoal">No conversations yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Start browsing storefronts and reach out to sellers to start a conversation!
            </p>
          </div>
          <Link to="/storefronts" className="btn-primary flex items-center gap-2">
            <ArrowLeft size={18} />
            Browse Storefronts
          </Link>
        </div>
      )}

      {/* No Results State */}
      {!isLoading && !error && chats.length > 0 && filteredChats.length === 0 && (
        <div className="animate-fade-in card flex flex-col items-center gap-6 py-12 text-center">
          <p className="text-slate-500">
            No conversations found matching "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-sm text-primary hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Chat List */}
      {!isLoading && !error && sortedChats.length > 0 && (
        <div className="space-y-6">
          {/* Unread Chats */}
          {unreadChats.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-700 px-2">
                Unread ({unreadChats.length})
              </h2>
              <div className="grid gap-3">
                {unreadChats.map((chat, idx) => (
                  <div
                    key={chat.id}
                    className={`animate-stagger-${(idx % 6) + 1}`}
                  >
                    <ChatListItem chat={chat} currentUserId={user?.userId} onlineUsers={onlineUsers} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Read Chats */}
          {readChats.length > 0 && (
            <div className="space-y-3">
              {unreadChats.length > 0 && (
                <h2 className="text-sm font-semibold text-slate-700 px-2">
                  All Conversations
                </h2>
              )}
              <div className="grid gap-3">
                {readChats.map((chat, idx) => (
                  <div
                    key={chat.id}
                    className={`animate-stagger-${((idx + unreadChats.length) % 6) + 1}`}
                  >
                    <ChatListItem chat={chat} currentUserId={user?.userId} onlineUsers={onlineUsers} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default ChatListPage
