import React, { useState, useRef, useEffect } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'

type ChatInputProps = {
  onSend: (message: string) => void
  onTyping: (isTyping: boolean) => void
  disabled?: boolean
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onTyping, disabled }) => {
  const [message, setMessage] = useState('')
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMessage(value)

    // Emit typing indicator
    if (value.trim()) {
      onTyping(true)

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Stop typing after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false)
      }, 1000)
    } else {
      onTyping(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
      onTyping(false)
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={handleChange}
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}
