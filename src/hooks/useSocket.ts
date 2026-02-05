import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3856'

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('connectingheart-token')
    
    if (!token) {
      console.error('❌ No auth token found')
      return
    }

    console.log('🔌 Connecting to socket:', SOCKET_URL)
    console.log('🔑 Using token:', token.substring(0, 20) + '...')
    
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: `Bearer ${token}`
      },
      transports: ['websocket'], // Force websocket only (faster than polling)
      upgrade: false, // Don't upgrade from polling to websocket
      reconnection: true,
      reconnectionDelay: 500, // Faster reconnection
      reconnectionAttempts: 10,
      timeout: 10000,
      forceNew: true, // Always create new connection
      autoConnect: true
    })

    newSocket.on('connect', () => {
      console.log('✅ Socket connected successfully!')
      console.log('📡 Socket ID:', newSocket.id)
      console.log('🚀 Transport:', newSocket.io.engine.transport.name)
      setIsConnected(true)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected. Reason:', reason)
      setIsConnected(false)
      
      // Auto reconnect if server disconnected
      if (reason === 'io server disconnect') {
        console.log('🔄 Server disconnected, reconnecting...')
        newSocket.connect()
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message)
      console.error('Full error:', error)
      setIsConnected(false)
    })

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnection attempt:', attemptNumber)
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('✅ Reconnected after', attemptNumber, 'attempts')
      setIsConnected(true)
    })

    newSocket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after all attempts')
    })

    // Heartbeat to keep connection alive
    const heartbeatInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit('ping')
      }
    }, 25000) // Every 25 seconds

    setSocket(newSocket)

    return () => {
      console.log('🔌 Disconnecting socket...')
      clearInterval(heartbeatInterval)
      newSocket.disconnect()
    }
  }, [])

  const emit = useCallback((event: string, data: unknown) => {
    if (socket) {
      if (socket.connected) {
        socket.emit(event, data)
      } else {
        console.warn('⚠️ Socket not connected, queuing message...')
        // Queue the message and send when reconnected
        socket.once('connect', () => {
          console.log('📤 Sending queued message:', event)
          socket.emit(event, data)
        })
      }
    } else {
      console.error('❌ Socket not initialized')
    }
  }, [socket])

  return { socket, isConnected, emit }
}
