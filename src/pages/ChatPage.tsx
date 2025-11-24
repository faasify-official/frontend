import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send, Store, Loader2 } from 'lucide-react'
import MessageBubble from '@components/MessageBubble'
import { apiGet, apiPost } from '@utils/api'
import { useAuth } from '@context/AuthContext'
import { useToast } from '@context/ToastContext'
import { useChatWebSocket } from '@hooks/useChatWebSocket'
import type { Chat, Message } from '../types/chat'

const ChatPage = () => {
  const { chatId } = useParams<{ chatId: string }>()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { isConnected, sendChatMessage, subscribeToChat, markMessageAsRead, subscribeToReadReceipts } = useChatWebSocket()

  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch chat and messages
  useEffect(() => {
    const fetchChatData = async () => {
      if (!chatId) {
        setError('Chat ID is required')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const [chatResponse, messagesResponse] = await Promise.all([
          apiGet<{ chat: Chat }>(`/chats/${chatId}`),
          apiGet<{ messages: Message[] }>(`/chats/${chatId}/messages`),
        ])

        setChat(chatResponse.chat)
        const fetchedMessages = messagesResponse.messages || []
        setMessages(fetchedMessages)

        // Mark all unread messages from other participants as read
        if (chatId && user?.userId) {
          const unreadMessages = fetchedMessages.filter(
            (msg) => msg.senderId !== user.userId && !msg.readAt
          )
          
          unreadMessages.forEach((msg) => {
            markMessageAsRead(chatId, msg.id)
          })
        }
      } catch (err: any) {
        console.error('Error fetching chat:', err)
        setError(err.message || 'Failed to load conversation')
      } finally {
        setIsLoading(false)
      }
    }

    fetchChatData()
  }, [chatId])

  // Subscribe to real-time messages via WebSocket
  useEffect(() => {
    if (!chatId || !isConnected) return

    const unsubscribe = subscribeToChat(chatId, (newMessage: Message) => {
      setMessages((prev) => {
        // Avoid duplicates - check if message already exists
        const exists = prev.some(msg => msg.id === newMessage.id)
        if (exists) return prev
        return [...prev, newMessage]
      })

      // Mark incoming messages as read (if not sent by current user)
      if (newMessage.senderId !== user?.userId && chatId) {
        markMessageAsRead(chatId, newMessage.id)
      }
    })

    return unsubscribe
  }, [chatId, isConnected, subscribeToChat, user?.userId, markMessageAsRead])

  // Subscribe to read receipts via WebSocket
  useEffect(() => {
    if (!chatId || !isConnected) return

    const unsubscribe = subscribeToReadReceipts(chatId, (messageId: string, _userId: string, readAt: string) => {
      // Update the message's readAt timestamp in the UI
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, readAt } : msg
        )
      )
    })

    return unsubscribe
  }, [chatId, isConnected, subscribeToReadReceipts])

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageText.trim() || !chatId || isSending) return

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      chatId,
      senderId: user?.userId || '',
      senderName: user?.name || 'You',
      content: messageText.trim(),
      createdAt: new Date().toISOString(),
    }

    // Optimistically add message to UI
    setMessages((prev) => [...prev, tempMessage])
    const messageContent = messageText.trim()
    setMessageText('')
    
    setIsSending(true)
    try {
      if (isConnected) {
        // Send via WebSocket for real-time delivery
        sendChatMessage(chatId, messageContent)
        
        // The actual message will come back via WebSocket subscription
        // Remove temp message after a short delay (it will be replaced by real one)
        setTimeout(() => {
          setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id))
        }, 100)
      } else {
        // Fallback to REST API if WebSocket not connected
        const response = await apiPost<{ message: Message }>(`/chats/${chatId}/messages`, {
          content: messageContent,
        })

        // Replace temp message with real one from server
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempMessage.id ? response.message : msg))
        )
      }
    } catch (err: any) {
      console.error('Error sending message:', err)
      showToast(err.message || 'Failed to send message', 'error')
      
      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id))
      
      // Restore message text so user can try again
      setMessageText(messageContent)
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  // Handle textarea auto-resize
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value)
    
    // Auto-resize textarea
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  // Handle Enter key to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  // Get other participant's name
  const otherParticipantName = chat
    ? chat.participantNames.find(
        (_name, idx) => chat.participants[idx] !== user?.userId
      ) || 'User'
    : 'User'

  if (isLoading) {
    return (
      <section className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-slate-500">Loading conversation...</p>
      </section>
    )
  }

  if (error || !chat) {
    return (
      <section className="flex flex-col items-center justify-center gap-4 py-12">
        <h1 className="text-2xl font-semibold text-charcoal">Conversation not found</h1>
        <p className="text-slate-500">
          {error || "The conversation you're looking for doesn't exist."}
        </p>
        <Link to="/chats" className="btn-primary flex items-center gap-2">
          <ArrowLeft size={18} />
          Back to Messages
        </Link>
      </section>
    )
  }

  return (
    <section className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto">
      {/* Chat Header */}
      <div className="animate-fade-in-up bg-white border-b-2 border-slate-100 px-4 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/chats"
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-charcoal">
                {otherParticipantName}
              </h1>
              {chat.storeName && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Store size={12} />
                  <Link
                    to={`/storefront/${chat.storeId}`}
                    className="hover:text-primary hover:underline"
                  >
                    {chat.storeName}
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-1.5 text-xs text-green-600">
                <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                <span className="hidden sm:inline">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="h-2 w-2 rounded-full bg-slate-400" />
                <span className="hidden sm:inline">Offline</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-6">
        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <p className="text-slate-500">No messages yet</p>
              <p className="text-sm text-slate-400 mt-2">
                Start the conversation by sending a message below
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === user?.userId}
                showSenderName={false}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="animate-fade-in-up bg-white border-t-2 border-slate-100 px-4 py-4 rounded-b-2xl">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={messageText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            disabled={isSending}
            className="flex-1 resize-none rounded-xl border-2 border-slate-100 px-4 py-3 text-sm focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!messageText.trim() || isSending}
            className="btn-primary flex items-center justify-center gap-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
        <p className="text-xs text-slate-400 mt-2 px-1">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </section>
  )
}

export default ChatPage
