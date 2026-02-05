import React from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

type ChatHeaderProps = {
  userName: string
  isOnline?: boolean
  isTyping?: boolean
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ userName, isOnline, isTyping }) => {
  const navigate = useNavigate()

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3 flex items-center gap-3">
      <button
        onClick={() => navigate(-1)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
      </button>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">{userName}</h2>
          {isOnline && (
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          )}
        </div>
        {isTyping && (
          <p className="text-sm text-gray-500">typing...</p>
        )}
      </div>
    </div>
  )
}
