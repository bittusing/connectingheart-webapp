import React from 'react'
import type { ChatMessage as ChatMessageType } from '../../types/chat'

type ChatMessageProps = {
  message: ChatMessageType
  isOwnMessage: boolean
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwnMessage }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-lg ${
          isOwnMessage
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        <p className="text-sm break-words">{message.message}</p>
        <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  )
}
