import React, { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'
import { useChat } from '../hooks/useChat'
import { ChatHeader } from '../components/chat/ChatHeader'
import { ChatMessage } from '../components/chat/ChatMessage'
import { ChatInput } from '../components/chat/ChatInput'
import type { ChatMessage as ChatMessageType, MessageSentEvent, TypingEvent, UserStatusEvent } from '../types/chat'

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>()
  const [searchParams] = useSearchParams()
  const userName = searchParams.get('name') || 'User'
  
  const { socket, isConnected } = useSocket()
  const { getChatHistory } = useChat()
  
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserId = localStorage.getItem('connectingheart-user-id') || ''

  // Debug logging
  useEffect(() => {
    console.log('🆔 Current User ID:', currentUserId)
    console.log('🆔 Chat with User ID:', userId)
    console.log('🔌 Socket connected:', isConnected)
  }, [currentUserId, userId, isConnected])

  // Load chat history
  useEffect(() => {
    if (userId) {
      loadHistory()
    }
  }, [userId])

  const loadHistory = async () => {
    if (!userId) return
    
    setLoading(true)
    const history = await getChatHistory(userId)
    if (history) {
      // Don't reverse - backend already sends in correct order (oldest to newest)
      console.log('📜 Loaded messages:', history.messages.length)
      console.log('📜 First message:', history.messages[0])
      console.log('📜 Last message:', history.messages[history.messages.length - 1])
      setMessages(history.messages)
    }
    setLoading(false)
  }

  // Socket event listeners
  useEffect(() => {
    if (!socket || !userId) return

    // Receive new message from OTHER user only
    socket.on('receive_message', (data: ChatMessageType) => {
      console.log('📨 Received message:', data)
      
      // Only add if it's from the other user (not from me)
      const msgSenderId = String(data.sender_id || '').trim()
      const myUserId = String(currentUserId || '').trim()
      
      if (msgSenderId !== myUserId) {
        setMessages(prev => {
          // Check for duplicates
          const exists = prev.find(msg => msg._id === data._id)
          if (exists) {
            console.log('⚠️ Duplicate message, skipping')
            return prev
          }
          console.log('✅ Adding received message')
          return [...prev, data]
        })
        
        // Mark as read
        socket.emit('mark_as_read', { senderId: userId })
      }
    })

    // Message sent confirmation - DON'T add to messages (already added optimistically)
    socket.on('message_sent', (data: MessageSentEvent) => {
      console.log('📤 Message sent confirmation:', data)
      
      if (data.creditDeducted) {
        alert('1 credit used for chat initiation')
      }
      
      // Update the temporary message with real ID from server
      setMessages(prev => prev.map(msg => {
        // If message has tempId and matches, update with real _id
        if (msg.tempId && msg.tempId === data.tempId) {
          return { ...msg, _id: data._id, tempId: undefined }
        }
        return msg
      }))
    })

    // Typing indicator
    socket.on('user_typing', (data: TypingEvent) => {
      if (data.userId === userId) {
        setIsTyping(data.isTyping)
      }
    })

    // Online status
    socket.on('user_online', (data: UserStatusEvent) => {
      if (data.userId === userId) {
        setIsOnline(true)
      }
    })

    socket.on('user_offline', (data: UserStatusEvent) => {
      if (data.userId === userId) {
        setIsOnline(false)
      }
    })

    // Mark messages as read when opening chat
    socket.emit('mark_as_read', { senderId: userId })

    return () => {
      socket.off('receive_message')
      socket.off('message_sent')
      socket.off('user_typing')
      socket.off('user_online')
      socket.off('user_offline')
    }
  }, [socket, userId])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (message: string) => {
    if (!socket || !userId) {
      console.error('Cannot send message: socket or userId missing')
      return
    }

    // Create temporary message for optimistic UI update
    const tempId = Date.now().toString()
    const tempMessage: ChatMessageType = {
      _id: tempId,
      tempId: tempId,
      sender_id: currentUserId,
      receiver_id: userId,
      message: message,
      messageType: 'text',
      isRead: false,
      createdAt: new Date().toISOString()
    }

    // Add to UI immediately (optimistic update)
    console.log('➕ Adding message optimistically:', tempMessage)
    setMessages(prev => [...prev, tempMessage])

    // Send to server
    socket.emit('send_message', {
      receiverId: userId,
      message: message,
      messageType: 'text',
      tempId: tempId // Send tempId to match with server response
    })
  }

  const handleTyping = (typing: boolean) => {
    if (!socket || !userId) return

    socket.emit('typing', {
      receiverId: userId,
      isTyping: typing
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader userName={userName} isOnline={isOnline} isTyping={isTyping} />
      
      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center">
          <p className="text-sm text-yellow-800">
            🔄 Reconnecting to server...
          </p>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            // Convert both to string and trim for comparison
            const msgSenderId = String(msg.sender_id || '').trim()
            const myUserId = String(currentUserId || '').trim()
            const isOwn = msgSenderId === myUserId
            
            return (
              <ChatMessage
                key={msg._id || msg.tempId || msg.createdAt}
                message={msg}
                isOwnMessage={isOwn}
              />
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSend={handleSendMessage}
        onTyping={handleTyping}
        disabled={!socket}
      />
    </div>
  )
}
