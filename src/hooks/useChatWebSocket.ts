import { useCallback } from 'react'
import { useWebSocket } from '@context/WebSocketContext'
import type { Message } from '../types/chat'
import type {
  ChatMessagePayload,
  ChatReadPayload,
  ChatMessageReceivedPayload,
  ChatNewPayload,
  ChatTypingPayload,
  ChatUserTypingPayload,
  UserOnlinePayload,
} from '../types/websocket'

type ChatWebSocketHook = {
  isConnected: boolean
  sendChatMessage: (chatId: string, content: string) => void
  markMessageAsRead: (chatId: string, messageId: string) => void
  sendTypingIndicator: (chatId: string, isTyping: boolean) => void
  subscribeToChat: (chatId: string, onMessage: (message: Message) => void) => () => void
  subscribeToAllMessages: (onMessage: (chatId: string, message: Message) => void) => () => void
  subscribeToNewChats: (onNewChat: (chatId: string) => void) => () => void
  subscribeToTyping: (chatId: string, onTyping: (userId: string, userName: string, isTyping: boolean) => void) => () => void
  subscribeToReadReceipts: (chatId: string, onRead: (messageId: string, userId: string, readAt: string) => void) => () => void
  subscribeToUserPresence: (onPresenceChange: (userId: string, online: boolean) => void) => () => void
}

export const useChatWebSocket = (): ChatWebSocketHook => {
  const { isConnected, sendMessage, subscribe } = useWebSocket()

  // Send a chat message
  const sendChatMessage = useCallback((chatId: string, content: string) => {
    const payload: ChatMessagePayload = {
      chatId,
      content,
    }
    sendMessage({
      type: 'chat:message',
      payload,
    })
  }, [sendMessage])

  // Mark a message as read
  const markMessageAsRead = useCallback((chatId: string, messageId: string) => {
    const payload: ChatReadPayload = {
      chatId,
      messageId,
    }
    sendMessage({
      type: 'chat:read',
      payload,
    })
  }, [sendMessage])

  // Send typing indicator
  const sendTypingIndicator = useCallback((chatId: string, isTyping: boolean) => {
    const payload: ChatTypingPayload = {
      chatId,
      isTyping,
    }
    sendMessage({
      type: 'chat:typing',
      payload,
    })
  }, [sendMessage])

  // Subscribe to messages for a specific chat
  const subscribeToChat = useCallback((chatId: string, onMessage: (message: Message) => void) => {
    return subscribe('chat:message', (payload: ChatMessageReceivedPayload) => {
      if (payload.chatId === chatId) {
        onMessage(payload.message)
      }
    })
  }, [subscribe])

  // Subscribe to all messages (for chat list updates)
  const subscribeToAllMessages = useCallback((onMessage: (chatId: string, message: Message) => void) => {
    return subscribe('chat:message', (payload: ChatMessageReceivedPayload) => {
      onMessage(payload.chatId, payload.message)
    })
  }, [subscribe])

  // Subscribe to new chat notifications
  const subscribeToNewChats = useCallback((onNewChat: (chatId: string) => void) => {
    return subscribe('chat:new', (payload: ChatNewPayload) => {
      onNewChat(payload.chatId)
    })
  }, [subscribe])

  // Subscribe to typing indicators
  const subscribeToTyping = useCallback((
    chatId: string,
    onTyping: (userId: string, userName: string, isTyping: boolean) => void
  ) => {
    return subscribe('chat:typing', (payload: ChatUserTypingPayload) => {
      if (payload.chatId === chatId) {
        onTyping(payload.userId, payload.userName, payload.isTyping)
      }
    })
  }, [subscribe])

  // Subscribe to read receipts
  const subscribeToReadReceipts = useCallback((
    chatId: string,
    onRead: (messageId: string, userId: string, readAt: string) => void
  ) => {
    return subscribe('chat:read', (payload) => {
      if (payload.chatId === chatId) {
        onRead(payload.messageId, payload.userId, payload.readAt)
      }
    })
  }, [subscribe])

  // Subscribe to user presence (online/offline)
  const subscribeToUserPresence = useCallback((
    onPresenceChange: (userId: string, online: boolean) => void
  ) => {
    return subscribe('user:online', (payload: UserOnlinePayload) => {
      onPresenceChange(payload.userId, payload.online)
    })
  }, [subscribe])

  return {
    isConnected,
    sendChatMessage,
    markMessageAsRead,
    sendTypingIndicator,
    subscribeToChat,
    subscribeToAllMessages,
    subscribeToNewChats,
    subscribeToTyping,
    subscribeToReadReceipts,
    subscribeToUserPresence,
  }
}
