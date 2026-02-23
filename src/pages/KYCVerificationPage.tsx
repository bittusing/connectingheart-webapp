import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { TextInput } from '../components/forms/TextInput'
import { OtpModal } from '../components/forms/OtpModal'
import { useApiClient } from '../hooks/useApiClient'
import { useUpdateLastActiveScreen } from '../hooks/useUpdateLastActiveScreen'
import { showToast } from '../utils/toast'
import { ShieldCheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

type GetUserResponse = {
  code: string
  status: string
  message: string
  data: {
    _id: string
    screenName?: string
    kycStatus?: 'pending' | 'verified' | 'failed'
    countryCode?: string
    [key: string]: any
  }
}

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

export const KYCVerificationPage = () => {
  const navigate = useNavigate()
  const api = useApiClient()
  const { updateLastActiveScreen } = useUpdateLastActiveScreen()

  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [referenceId, setReferenceId] = useState('')
  const [otpModalOpen, setOtpModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [kycStatus, setKycStatus] = useState<'pending' | 'verified' | 'failed'>('pending')
  const [loading, setLoading] = useState(true)
  const [kycData, setKycData] = useState<any>(null)

  // Check KYC status and redirect if needed
  useEffect(() => {
    const checkKycStatus = async () => {
      try {
        // Check user's country code and KYC status
        const userResponse = await api.get<GetUserResponse>('auth/getUser')
        
        if (userResponse.status === 'success' && userResponse.data) {
          const { countryCode, kycStatus: userKycStatus, screenName } = userResponse.data

          // If not Indian user (+91), skip KYC and go to SRCM
          if (countryCode && countryCode !== '+91') {
            showToast('Aadhar verification is only for Indian users. Proceeding to next step.', 'success')
            await updateLastActiveScreen('srcmdetails')
            navigate('/dashboard/srcmdetails', { replace: true })
            return
          }

          // If KYC already verified, go to SRCM
          if (userKycStatus === 'verified') {
            showToast('KYC already verified', 'success')
            await updateLastActiveScreen('srcmdetails')
            navigate('/dashboard/srcmdetails', { replace: true })
            return
          }

          // Check if should be on this page
          if (screenName && screenName.toLowerCase() !== 'kycverification') {
            const routeMap: Record<string, string> = {
              personaldetails: '/dashboard/personaldetails',
              careerdetails: '/dashboard/careerdetails',
              socialdetails: '/dashboard/socialdetails',
              kycverification: '/dashboard/kycverification',
              srcmdetails: '/dashboard/srcmdetails',
              familydetails: '/dashboard/familydetails',
              partnerpreferences: '/dashboard/partnerpreferences',
              aboutyou: '/dashboard/aboutyou',
              underverification: '/under-verification',
              dashboard: '/dashboard',
            }
            
            if (screenName.toLowerCase() !== 'kycverification' && routeMap[screenName.toLowerCase()]) {
              navigate(routeMap[screenName.toLowerCase()], { replace: true })
              return
            }
          }

          setKycStatus(userKycStatus || 'pending')
        }
      } catch (error) {
        console.error('Error checking KYC status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkKycStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        setKycStatus('verified')
        setKycData(response.kycData)
        setOtpModalOpen(false)
        showToast(response.message || 'Aadhar verification completed successfully!', 'success')
        
        // Update screen name and navigate to SRCM
        await updateLastActiveScreen('srcmdetails')
        
        setTimeout(() => {
          navigate('/dashboard/srcmdetails', { replace: true })
        }, 2000)
      } else {
        throw new Error(response.message || 'OTP verification failed')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'OTP verification failed'
      showToast(message.replace('API ', ''), 'error')
    }
  }

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f8f2ff] to-white">
        <div className="rounded-3xl bg-white/90 px-8 py-12 text-center shadow-2xl">
          Checking Aadhar status...
        </div>
      </section>
    )
  }

  if (kycStatus === 'verified') {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f8f2ff] to-white">
        <div className="rounded-3xl bg-white/90 px-8 py-12 text-center shadow-2xl">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">Aadhar Verified!</h2>
          <p className="mt-2 text-slate-600">Redirecting to next step...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#f8f2ff] via-white to-white py-10">
      <div className="mx-auto w-full max-w-2xl rounded-[32px] bg-white/95 p-8 shadow-[0_25px_70px_rgba(67,56,202,0.15)]">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-[#ff4f8b] to-[#ffa0d2]" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">
              Step 3.5 of 7
            </p>
            <div className="flex items-center justify-center gap-3">
              <ShieldCheckIcon className="h-8 w-8 text-pink-500" />
              <h1 className="text-2xl font-semibold text-slate-900">Aadhar Verification</h1>
            </div>
            <p className="text-sm text-slate-500">
              Verify your identity using Aadhaar for a secure experience
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
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
              <h3 className="text-sm font-semibold text-blue-900">Why Aadhar?</h3>
              <p className="mt-1 text-xs text-blue-700">
                Aadhar verification ensures authenticity and builds trust in our community. Your Aadhaar
                details are securely stored and never shared.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleGenerateOtp}>
          <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-inner">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
                <span className="text-lg font-bold text-pink-600">1</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Enter Aadhaar Number</p>
                <p className="text-xs text-slate-500">12-digit Aadhaar number</p>
              </div>
            </div>

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

            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-600">
                <span className="font-semibold">Note:</span> OTP will be sent to the mobile number
                registered with your Aadhaar.
              </p>
            </div>
          </div>

          {/* Steps Preview */}
          <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
            <p className="mb-4 text-sm font-semibold text-slate-700">Verification Steps:</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-white">
                  1
                </div>
                <p className="text-sm text-slate-600">Enter your 12-digit Aadhaar number</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-white">
                  2
                </div>
                <p className="text-sm text-slate-600">
                  Receive OTP on Aadhaar registered mobile
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-white">
                  3
                </div>
                <p className="text-sm text-slate-600">Enter OTP to complete verification</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              className="text-sm font-semibold text-slate-500 hover:text-slate-700"
              onClick={() => navigate('/dashboard/socialdetails', { replace: true })}
            >
              ← Back
            </button>
            <Button type="submit" size="lg" disabled={submitting || aadhaarNumber.length !== 12}>
              {submitting ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </div>
        </form>
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
    </section>
  )
}
