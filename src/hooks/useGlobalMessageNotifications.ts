import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useChatWebSocket } from './useChatWebSocket'
import { useToast } from '@context/ToastContext'
import { useAuth } from '@context/AuthContext'

/**
 * Global hook to show toast notifications for incoming messages
 * when user is not on the chat page or chat list page
 */
export const useGlobalMessageNotifications = () => {
  const location = useLocation()
  const { subscribeToAllMessages, isConnected } = useChatWebSocket()
  const { showToast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (!isConnected) return

    // Don't show notifications if user is on chat pages
    const isChatPage = location.pathname.startsWith('/chat')
    const isChatListPage = location.pathname === '/chats'

    if (isChatPage || isChatListPage) {
      return
    }

    // Subscribe to all messages
    const unsubscribe = subscribeToAllMessages((_: string, message) => {
      // Only show notification if message is from someone else
      if (message.senderId !== user?.userId) {
        showToast(
          `New message from ${message.senderName}: ${message.content.length > 50 ? message.content.substring(0, 50) + '...' : message.content}`,
          'info'
        )
      }
    })

    return unsubscribe
  }, [isConnected, location.pathname, subscribeToAllMessages, showToast, user?.userId])
}
