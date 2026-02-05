import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../hooks/useChat'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import type { ChatConversation } from '../types/chat'

export const ChatListPage: React.FC = () => {
  const navigate = useNavigate()
  const { getChatList, loading } = useChat()
  const [conversations, setConversations] = useState<ChatConversation[]>([])

  useEffect(() => {
    loadChatList()
  }, [])

  const loadChatList = async () => {
    const list = await getChatList()
    setConversations(list)
  }

  const handleChatClick = (conversation: ChatConversation) => {
    // Note: Membership check is done in ChatButton component
    // Here we directly navigate as user already has chat history
    navigate(`/dashboard/chat/${conversation.userId}?name=${encodeURIComponent(conversation.userName)}`)
  }

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ChatBubbleLeftRightIcon className="w-16 h-16 mb-4" />
            <p>No conversations yet</p>
            <p className="text-sm">Start chatting with someone!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => (
              <button
                key={conversation.userId}
                onClick={() => handleChatClick(conversation)}
                className="w-full px-4 py-4 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {conversation.userName.charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conversation.userName}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatTime(conversation.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.isLastMessageFromMe && 'You: '}
                        {conversation.lastMessage}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="ml-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
