import { useCallback, useState } from 'react'
import { useApiClient } from './useApiClient'
import { showToast } from '../utils/toast'
import type { PaymentOrderResponse, PaymentVerificationResponse, RazorpayPaymentResponse } from '../types/dashboard'

// Razorpay types
interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  order_id: string
  handler: (response: RazorpayPaymentResponse) => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
  modal?: {
    ondismiss?: () => void
  }
}

interface RazorpayInstance {
  open: () => void
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance
}

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: RazorpayConstructor
  }
}

/**
 * Custom hook to handle Razorpay payment flow
 * Implements the three-step payment process:
 * 1. Create order with backend
 * 2. Initialize Razorpay checkout
 * 3. Verify payment with backend
 */
export const usePayment = () => {
  const api = useApiClient()
  const [isProcessing, setIsProcessing] = useState(false)

  const processPayment = useCallback(
    async (membershipId: string, onSuccess?: () => void) => {
      if (isProcessing) {
        return
      }

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        showToast('Payment gateway is not available. Please refresh the page.', 'error')
        return
      }

      setIsProcessing(true)

      try {
        // STEP 1: Create order with backend
        const orderData = await api.get<PaymentOrderResponse>(
          `dashboard/buyMembership/${membershipId}`
        )

        // STEP 2: Initialize Razorpay checkout
        const options: RazorpayOptions = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Connecting Hearts',
          order_id: orderData.orderId,
          handler: async (response: RazorpayPaymentResponse) => {
            try {
              // STEP 3: Verify payment with backend
              const verifyResponse = await api.get<PaymentVerificationResponse>(
                `dashboard/verifyPayment/${response.razorpay_order_id}`
              )

              if (verifyResponse.status === 'success') {
                showToast(verifyResponse.message || 'Payment successful! Membership activated.', 'success')
                onSuccess?.()
              } else {
                showToast(verifyResponse.message || 'Payment verification failed.', 'error')
              }
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message.replace('API ', '') || 'Payment verification failed.'
                  : 'Payment verification failed.'
              showToast(message, 'error')
            } finally {
              setIsProcessing(false)
            }
          },
          prefill: {
            // You can add user details here if available
          },
          theme: {
            color: '#ec4899', // Pink color matching your theme
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false)
            },
          },
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message.replace('API ', '') || 'Failed to initialize payment.'
            : 'Failed to initialize payment.'
        showToast(message, 'error')
        setIsProcessing(false)
      }
    },
    [api, isProcessing]
  )

  return {
    processPayment,
    isProcessing,
  }
}

