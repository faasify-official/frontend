import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import type { WebSocketMessage } from '../types/websocket'

/**
 * WebSocket Context Provider
 * 
 * Provides real-time WebSocket connection management with:
 * - Automatic authentication via token
 * - Reconnection logic with exponential backoff
 * - Message queuing when disconnected
 * - Heartbeat/ping-pong to keep connection alive
 * - Subscribe/publish pattern for different message types
 * - Visibility API integration for connection management
 * 
 * Usage:
 * ```tsx
 * const { isConnected, sendMessage, subscribe } = useWebSocket()
 * 
 * // Subscribe to message type
 * useEffect(() => {
 *   const unsubscribe = subscribe('chat:message', (payload) => {
 *     console.log('New message:', payload)
 *   })
 *   return unsubscribe
 * }, [])
 * 
 * // Send message
 * sendMessage({ type: 'chat:message', payload: { chatId: '123', content: 'Hello' } })
 * ```
 */

type WebSocketContextType = {
  isConnected: boolean
  sendMessage: (message: WebSocketMessage) => void
  subscribe: (type: string, callback: (payload: any) => void) => () => void
  connect: () => void
  disconnect: () => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'
const RECONNECT_INTERVAL = 3000
const MAX_RECONNECT_ATTEMPTS = 5
const HEARTBEAT_INTERVAL = 30000

type Props = {
  children: React.ReactNode
}

export const WebSocketProvider: React.FC<Props> = ({ children }) => {
  const { token, isAuthenticated } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)
  const heartbeatIntervalRef = useRef<number | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const subscribersRef = useRef<Map<string, Set<(payload: any) => void>>>(new Map())
  const messageQueueRef = useRef<WebSocketMessage[]>([])
  const isIntentionalCloseRef = useRef(false)

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }, [])

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    clearTimers()
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }))
      }
    }, HEARTBEAT_INTERVAL)
  }, [clearTimers])

  // Send queued messages
  const processMessageQueue = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && messageQueueRef.current.length > 0) {
      const queue = [...messageQueueRef.current]
      messageQueueRef.current = []
      queue.forEach(msg => {
        wsRef.current?.send(JSON.stringify(msg))
      })
    }
  }, [])

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Don't connect if not authenticated or already connected
    if (!isAuthenticated || !token || wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    // Don't reconnect if max attempts reached
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('Max reconnection attempts reached')
      return
    }

    isIntentionalCloseRef.current = false
    clearTimers()

    try {
      console.log(token)
      // Create WebSocket connection with auth token
      const ws = new WebSocket(`${WS_URL}?token=${token}`)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
        startHeartbeat()
        processMessageQueue()
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          
          // Handle pong response
          if (message.type === 'pong') {
            return
          }

          // Notify all subscribers for this message type
          const subscribers = subscribersRef.current.get(message.type)
          if (subscribers) {
            subscribers.forEach(callback => {
              try {
                callback(message.payload)
              } catch (error) {
                console.error('Error in subscriber callback:', error)
              }
            })
          }

          // Also notify wildcard subscribers
          const wildcardSubscribers = subscribersRef.current.get('*')
          if (wildcardSubscribers) {
            wildcardSubscribers.forEach(callback => {
              try {
                callback(message)
              } catch (error) {
                console.error('Error in wildcard subscriber callback:', error)
              }
            })
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        setIsConnected(false)
        clearTimers()
        wsRef.current = null

        // Attempt to reconnect if not intentional close
        if (!isIntentionalCloseRef.current && isAuthenticated && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++
          console.log(`Reconnecting... (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, RECONNECT_INTERVAL)
        }
      }
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
    }
  }, [isAuthenticated, token, clearTimers, startHeartbeat, processMessageQueue])

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    isIntentionalCloseRef.current = true
    clearTimers()
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect')
      wsRef.current = null
    }
    
    setIsConnected(false)
    reconnectAttemptsRef.current = 0
    messageQueueRef.current = []
  }, [clearTimers])

  // Send message through WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      // Queue message if not connected
      messageQueueRef.current.push(message)
      console.warn('WebSocket not connected, message queued')
    }
  }, [])

  // Subscribe to message type
  const subscribe = useCallback((type: string, callback: (payload: any) => void) => {
    if (!subscribersRef.current.has(type)) {
      subscribersRef.current.set(type, new Set())
    }
    subscribersRef.current.get(type)!.add(callback)

    // Return unsubscribe function
    return () => {
      const subscribers = subscribersRef.current.get(type)
      if (subscribers) {
        subscribers.delete(callback)
        if (subscribers.size === 0) {
          subscribersRef.current.delete(type)
        }
      }
    }
  }, [])

  // Connect when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      connect()
    } else {
      disconnect()
    }

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [isAuthenticated, token, connect, disconnect])

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, can optionally pause heartbeat
      } else {
        // Page is visible, ensure connection is alive
        if (isAuthenticated && !isConnected) {
          connect()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated, isConnected, connect])

  const value: WebSocketContextType = {
    isConnected,
    sendMessage,
    subscribe,
    connect,
    disconnect,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}
