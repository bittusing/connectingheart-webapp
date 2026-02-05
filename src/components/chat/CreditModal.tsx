import React from 'react'

type CreditModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName?: string
}

export const CreditModal: React.FC<CreditModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">
          Credit Confirmation
        </h3>
        <p className="text-gray-700 mb-6">
          {userName ? `${userName} से ` : ''}Chatting karne par aapka 1 credit use hoga
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
