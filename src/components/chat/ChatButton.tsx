import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { useChat } from '../../hooks/useChat'
import { CreditModal } from './CreditModal'
import { showToast } from '../../utils/toast'

type ChatButtonProps = {
  userId: string
  userName: string
  className?: string
  variant?: 'icon' | 'button'
  children?: React.ReactNode
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  userId,
  userName,
  className = '',
  variant = 'button',
  children
}) => {
  const navigate = useNavigate()
  const { checkEligibility } = useChat()
  const [showModal, setShowModal] = useState(false)
  const [checking, setChecking] = useState(false)

  const handleChatClick = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setChecking(true)
    
    try {
      const eligibility = await checkEligibility(userId)
      
      if (!eligibility) {
        showToast('Failed to check eligibility', 'error')
        return
      }

      if (!eligibility.canChat) {
        showToast('You need an active membership to chat. Please upgrade your plan.', 'error')
        return
      }

      // Show modal if credit required and not already initiated
      if (eligibility.creditRequired && !eligibility.alreadyInitiated) {
        setShowModal(true)
      } else {
        // Open chat directly
        openChat()
      }
    } catch (error) {
      showToast('Failed to check eligibility', 'error')
    } finally {
      setChecking(false)
    }
  }

  const openChat = () => {
    navigate(`/dashboard/chat/${userId}?name=${encodeURIComponent(userName)}`)
  }

  const handleConfirm = () => {
    setShowModal(false)
    openChat()
  }

  if (children) {
    // Custom render with children
    return (
      <>
        <button
          onClick={handleChatClick}
          disabled={checking}
          className={className}
        >
          {children}
        </button>
        <CreditModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
          userName={userName}
        />
      </>
    )
  }

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleChatClick}
          disabled={checking}
          className={`p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 ${className}`}
          title="Chat"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-gray-700" />
        </button>
        <CreditModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
          userName={userName}
        />
      </>
    )
  }

  return (
    <>
      <button
        onClick={handleChatClick}
        disabled={checking}
        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <ChatBubbleLeftRightIcon className="w-5 h-5" />
        <span>{checking ? 'Checking...' : 'Chat'}</span>
      </button>
      <CreditModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        userName={userName}
      />
    </>
  )
}
