import { useState } from 'react'
import { Button } from '../common/Button'
import { TextInput } from './TextInput'
import { OtpModal } from './OtpModal'
import { useApiClient } from '../../hooks/useApiClient'
import { showToast } from '../../utils/toast'
import { ShieldCheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

type GenerateOtpResponse = {
  code: string
  status: string
  message: string
  referenceId: string
  transactionId: string
}

type VerifyOtpResponse = {
  code: string
  status: string
  message: string
  kycData: {
    name: string
    dateOfBirth: string
    gender: string
    address: string
  }
}

type KYCModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export const KYCModal = ({ open, onClose, onSuccess }: KYCModalProps) => {
  const api = useApiClient()
  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [referenceId, setReferenceId] = useState('')
  const [otpModalOpen, setOtpModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const handleGenerateOtp = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      showToast('Please enter a valid 12-digit Aadhaar number', 'error')
      return
    }

    setSubmitting(true)
    try {
      const response = await api.post<{ aadhaarNumber: string }, GenerateOtpResponse>(
        'kyc/generate-otp',
        { aadhaarNumber }
      )

      if (response.status === 'success' && response.referenceId) {
        setReferenceId(response.referenceId)
        showToast(response.message || 'OTP sent to your Aadhaar registered mobile number', 'success')
        setOtpModalOpen(true)
      } else {
        throw new Error(response.message || 'Failed to send OTP')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP'
      showToast(message.replace('API ', ''), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyOtp = async (otp: string) => {
    if (!referenceId) {
      showToast('Reference ID missing. Please try again.', 'error')
      return
    }

    try {
      const response = await api.post<
        { referenceId: string; otp: string },
        VerifyOtpResponse
      >('kyc/verify-otp', {
        referenceId,
        otp,
      })

      if (response.status === 'success') {
        setOtpModalOpen(false)
        showToast(response.message || 'Aadhar verification completed successfully!', 'success')
        
        // Reset form
        setAadhaarNumber('')
        setReferenceId('')
        
        // Call success callback
        onSuccess()
      } else {
        throw new Error(response.message || 'OTP verification failed')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'OTP verification failed'
      showToast(message.replace('API ', ''), 'error')
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
        <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
              <ShieldCheckIcon className="h-8 w-8 text-pink-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">Complete Aadhar Verification</h2>
            <p className="mt-2 text-sm text-slate-600">
              Verify your identity using Aadhaar to access all features
            </p>
          </div>

          {/* Info Card */}
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-blue-700">
                  OTP will be sent to the mobile number registered with your Aadhaar. Your data is
                  secure and never shared.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="mt-6 space-y-4" onSubmit={handleGenerateOtp}>
            <TextInput
              label="Aadhaar Number"
              type="text"
              required
              maxLength={12}
              placeholder="Enter 12-digit Aadhaar number"
              value={aadhaarNumber}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, '')
                setAadhaarNumber(value)
              }}
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Skip for now
              </button>
              <Button
                type="submit"
                size="lg"
                disabled={submitting || aadhaarNumber.length !== 12}
                className="flex-1"
              >
                {submitting ? 'Sending...' : 'Send OTP'}
              </Button>
            </div>
          </form>

          {/* Steps */}
          <div className="mt-6 space-y-2 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-700">Quick Steps:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white">
                  1
                </span>
                Enter Aadhaar number
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-300 text-[10px] font-bold text-white">
                  2
                </span>
                Receive OTP on registered mobile
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-300 text-[10px] font-bold text-white">
                  3
                </span>
                Verify OTP to complete
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <OtpModal
        open={otpModalOpen}
        onClose={() => {
          setOtpModalOpen(false)
          setReferenceId('')
        }}
        onVerify={handleVerifyOtp}
      />
    </>
  )
}
