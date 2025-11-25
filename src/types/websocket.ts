import type { Message, Chat } from './chat'

/**
 * Base WebSocket Message Structure
 */
export type WebSocketMessage<T = any> = {
  type: string
  payload: T
}

/**
 * Client to Server Messages
 */

// Send a chat message
export type ChatMessagePayload = {
  chatId: string
  content: string
}

// Mark message as read
export type ChatReadPayload = {
  chatId: string
  messageId: string
}

// Typing indicator
export type ChatTypingPayload = {
  chatId: string
  isTyping: boolean
}

// Heartbeat ping
export type PingPayload = Record<string, never> // Empty object

/**
 * Server to Client Messages
 */

// New message received
export type ChatMessageReceivedPayload = {
  chatId: string
  message: Message
}

// New chat created
export type ChatNewPayload = {
  chatId: string
  chat?: Chat
}

// Message read receipt
export type ChatMessageReadPayload = {
  chatId: string
  messageId: string
  userId: string
  readAt: string
}

// User typing indicator
export type ChatUserTypingPayload = {
  chatId: string
  userId: string
  userName: string
  isTyping: boolean
}

// User online status
export type UserOnlinePayload = {
  userId: string
  online: boolean
}

// Chat updated (e.g., participant added/removed)
export type ChatUpdatedPayload = {
  chatId: string
  chat: Chat
}

// Heartbeat pong response
export type PongPayload = {
  timestamp?: string
}

// Error message
export type ErrorPayload = {
  code: string
  message: string
  details?: any
}

/**
 * Typed WebSocket Message Unions
 */

// Client -> Server message types
export type ClientMessage =
  | WebSocketMessage<ChatMessagePayload> & { type: 'chat:message' }
  | WebSocketMessage<ChatReadPayload> & { type: 'chat:read' }
  | WebSocketMessage<ChatTypingPayload> & { type: 'chat:typing' }
  | WebSocketMessage<PingPayload> & { type: 'ping' }

// Server -> Client message types
export type ServerMessage =
  | WebSocketMessage<ChatMessageReceivedPayload> & { type: 'chat:message' }
  | WebSocketMessage<ChatNewPayload> & { type: 'chat:new' }
  | WebSocketMessage<ChatMessageReadPayload> & { type: 'chat:read' }
  | WebSocketMessage<ChatUserTypingPayload> & { type: 'chat:typing' }
  | WebSocketMessage<UserOnlinePayload> & { type: 'user:online' }
  | WebSocketMessage<ChatUpdatedPayload> & { type: 'chat:updated' }
  | WebSocketMessage<PongPayload> & { type: 'pong' }
  | WebSocketMessage<ErrorPayload> & { type: 'error' }

/**
 * Type guards for message type checking
 */

export const isChatMessage = (msg: WebSocketMessage): msg is WebSocketMessage<ChatMessageReceivedPayload> => {
  return msg.type === 'chat:message'
}

export const isChatNew = (msg: WebSocketMessage): msg is WebSocketMessage<ChatNewPayload> => {
  return msg.type === 'chat:new'
}

export const isChatRead = (msg: WebSocketMessage): msg is WebSocketMessage<ChatMessageReadPayload> => {
  return msg.type === 'chat:read'
}

export const isChatTyping = (msg: WebSocketMessage): msg is WebSocketMessage<ChatUserTypingPayload> => {
  return msg.type === 'chat:typing'
}

export const isUserOnline = (msg: WebSocketMessage): msg is WebSocketMessage<UserOnlinePayload> => {
  return msg.type === 'user:online'
}

export const isChatUpdated = (msg: WebSocketMessage): msg is WebSocketMessage<ChatUpdatedPayload> => {
  return msg.type === 'chat:updated'
}

export const isPong = (msg: WebSocketMessage): msg is WebSocketMessage<PongPayload> => {
  return msg.type === 'pong'
}

export const isError = (msg: WebSocketMessage): msg is WebSocketMessage<ErrorPayload> => {
  return msg.type === 'error'
}

/**
 * WebSocket Event Handlers
 */

export type WebSocketEventHandlers = {
  onChatMessage?: (payload: ChatMessageReceivedPayload) => void
  onChatNew?: (payload: ChatNewPayload) => void
  onChatRead?: (payload: ChatMessageReadPayload) => void
  onChatTyping?: (payload: ChatUserTypingPayload) => void
  onUserOnline?: (payload: UserOnlinePayload) => void
  onChatUpdated?: (payload: ChatUpdatedPayload) => void
  onPong?: (payload: PongPayload) => void
  onError?: (payload: ErrorPayload) => void
}
