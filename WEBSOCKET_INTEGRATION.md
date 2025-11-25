# WebSocket Integration Guide

## Overview
The WebSocket provider has been created and integrated into the application. It automatically connects when a user is authenticated and handles reconnection, message queuing, and heartbeats.

## Files Created

### 1. **WebSocketContext.tsx** (`src/context/WebSocketContext.tsx`)
Main WebSocket provider with:
- Automatic connection on authentication
- Reconnection logic (max 5 attempts, 3s interval)
- Message queuing for offline messages
- Heartbeat every 30s to keep connection alive
- Subscribe/publish pattern for message types
- Page visibility handling
- Full TypeScript type safety

### 2. **useChatWebSocket.ts** (`src/hooks/useChatWebSocket.ts`)
Specialized hook for chat functionality:
- `sendChatMessage(chatId, content)` - Send a message
- `markMessageAsRead(chatId, messageId)` - Mark message as read
- `sendTypingIndicator(chatId, isTyping)` - Send typing status
- `subscribeToChat(chatId, callback)` - Subscribe to chat messages
- `subscribeToNewChats(callback)` - Subscribe to new chat notifications
- `subscribeToTyping(chatId, callback)` - Subscribe to typing indicators
- `subscribeToReadReceipts(chatId, callback)` - Subscribe to read receipts

### 3. **websocket.ts** (`src/types/websocket.ts`)
Comprehensive TypeScript types for all WebSocket messages:
- Client-to-server payload types
- Server-to-client payload types
- Type unions for all messages
- Type guard functions for runtime type checking
- Event handler type definitions

## Integration in main.tsx
The WebSocketProvider is wrapped around the app in the provider hierarchy:
```tsx
<AuthProvider>
  <ToastProvider>
    <WebSocketProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </WebSocketProvider>
  </ToastProvider>
</AuthProvider>
```

## How to Use in Components

### Example: ChatPage with WebSocket

```tsx
import { useChatWebSocket } from '@hooks/useChatWebSocket'

const ChatPage = () => {
  const { chatId } = useParams()
  const { isConnected, subscribeToChat, sendChatMessage } = useChatWebSocket()
  const [messages, setMessages] = useState<Message[]>([])

  // Subscribe to incoming messages
  useEffect(() => {
    if (!chatId) return

    const unsubscribe = subscribeToChat(chatId, (newMessage) => {
      setMessages(prev => [...prev, newMessage])
    })

    return unsubscribe
  }, [chatId, subscribeToChat])

  // Send a message via WebSocket instead of API
  const handleSendMessage = (content: string) => {
    if (chatId) {
      // Optimistically add to UI
      setMessages(prev => [...prev, tempMessage])
      
      // Send via WebSocket
      sendChatMessage(chatId, content)
    }
  }

  return (
    <div>
      {!isConnected && <div>Connecting...</div>}
      {/* Rest of component */}
    </div>
  )
}
```

### Example: ChatListPage with WebSocket

```tsx
import { useChatWebSocket } from '@hooks/useChatWebSocket'

const ChatListPage = () => {
  const { subscribeToNewChats } = useChatWebSocket()
  const [chats, setChats] = useState<Chat[]>([])

  // Subscribe to new chat notifications
  useEffect(() => {
    const unsubscribe = subscribeToNewChats((chatId) => {
      // Fetch the new chat and add to list
      fetchChat(chatId).then(chat => {
        setChats(prev => [chat, ...prev])
      })
    })

    return unsubscribe
  }, [subscribeToNewChats])

  // Rest of component
}
```

## Environment Variable
Add to your `.env` file:
```
VITE_WS_URL=ws://localhost:8080
```

Or for production:
```
VITE_WS_URL=wss://your-domain.com
```

## WebSocket Message Protocol

All messages follow a consistent structure with full TypeScript type safety.

### Message Structure
```typescript
type WebSocketMessage<T> = {
  type: string
  payload: T
}
```

### Client -> Server Messages

**Send message:**
```typescript
type ChatMessagePayload = {
  chatId: string
  content: string
}

// Usage
{
  type: 'chat:message',
  payload: {
    chatId: string,
    content: string
  }
}
```

**Mark as read:**
```typescript
type ChatReadPayload = {
  chatId: string
  messageId: string
}

// Usage
{
  type: 'chat:read',
  payload: {
    chatId: string,
    messageId: string
  }
}
```

**Typing indicator:**
```typescript
type ChatTypingPayload = {
  chatId: string
  isTyping: boolean
}

// Usage
{
  type: 'chat:typing',
  payload: {
    chatId: string,
    isTyping: boolean
  }
}
```

**Heartbeat:**
```typescript
{
  type: 'ping',
  payload: {}
}
```

### Server -> Client Messages

**New message:**
```typescript
type ChatMessageReceivedPayload = {
  chatId: string
  message: Message
}

// Usage
{
  type: 'chat:message',
  payload: {
    chatId: string,
    message: Message
  }
}
```

**New chat created:**
```typescript
type ChatNewPayload = {
  chatId: string
  chat?: Chat
}

// Usage
{
  type: 'chat:new',
  payload: {
    chatId: string,
    chat?: Chat
  }
}
```

**Message read receipt:**
```typescript
type ChatMessageReadPayload = {
  chatId: string
  messageId: string
  userId: string
  readAt: string
}

// Usage
{
  type: 'chat:read',
  payload: {
    chatId: string,
    messageId: string,
    userId: string,
    readAt: string
  }
}
```

**User typing:**
```typescript
type ChatUserTypingPayload = {
  chatId: string
  userId: string
  userName: string
  isTyping: boolean
}

// Usage
{
  type: 'chat:typing',
  payload: {
    chatId: string,
    userId: string,
    userName: string,
    isTyping: boolean
  }
}
```

**User online status:**
```typescript
type UserOnlinePayload = {
  userId: string
  online: boolean
}

// Usage
{
  type: 'user:online',
  payload: {
    userId: string,
    online: boolean
  }
}
```

**Chat updated:**
```typescript
type ChatUpdatedPayload = {
  chatId: string
  chat: Chat
}

// Usage
{
  type: 'chat:updated',
  payload: {
    chatId: string,
    chat: Chat
  }
}
```

**Heartbeat response:**
```typescript
type PongPayload = {
  timestamp?: string
}

// Usage
{
  type: 'pong',
  payload: {
    timestamp?: string
  }
}
```

**Error message:**
```typescript
type ErrorPayload = {
  code: string
  message: string
  details?: any
}

// Usage
{
  type: 'error',
  payload: {
    code: string,
    message: string,
    details?: any
  }
}
```

### Type Guards

Use type guards for runtime type checking:

```typescript
import { isChatMessage, isChatNew, isChatTyping } from '@types/websocket'

const message = JSON.parse(event.data)

if (isChatMessage(message)) {
  // TypeScript knows this is ChatMessageReceivedPayload
  console.log(message.payload.chatId)
  console.log(message.payload.message)
}

if (isChatTyping(message)) {
  // TypeScript knows this is ChatUserTypingPayload
  console.log(message.payload.isTyping)
}
```

## Features

✅ **Auto-connect on authentication** - Connects automatically when user logs in  
✅ **Auto-reconnect** - Retries up to 5 times with 3s intervals  
✅ **Message queuing** - Queues messages when disconnected, sends when reconnected  
✅ **Heartbeat** - Sends ping every 30s to keep connection alive  
✅ **Type-safe subscriptions** - Subscribe to specific message types  
✅ **Page visibility handling** - Reconnects when tab becomes active  
✅ **Clean disconnect** - Properly closes connection on logout  
✅ **Error handling** - Graceful error handling with console logging  

## Next Steps

To fully integrate WebSocket into the chat system:

1. Update `ChatPage.tsx` to use `useChatWebSocket` for real-time messages
2. Update `ChatListPage.tsx` to show real-time unread counts
3. Add typing indicators (optional)
4. Add online/offline status (optional)
5. Update backend to handle WebSocket connections and broadcast messages
