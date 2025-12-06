import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { AuthCard } from '../components/forms/AuthCard'
import { TextInput } from '../components/forms/TextInput'
import { Toast } from '../components/common/Toast'
import { useApiClient } from '../hooks/useApiClient'
import { OtpModal } from '../components/forms/OtpModal'
import { SetNewPasswordModal } from '../components/forms/SetNewPasswordModal'

type ToastMessage = {
  id: string
  message: string
  variant: 'success' | 'error'
}

export const ForgotPasswordPage = () => {
  const api = useApiClient()
  const navigate = useNavigate()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [otpModalOpen, setOtpModalOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [forgotPasswordToken, setForgotPasswordToken] = useState<string | null>(null)
  const [originalToken, setOriginalToken] = useState<string | null>(null)

  const showToast = (message: string, variant: 'success' | 'error') => {
    const id = globalThis.crypto?.randomUUID() ?? `${Date.now()}`
    setToasts((prev) => [...prev, { id, message, variant }])
  }

  const dismissToast = (toastId: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId))
  }

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      showToast('Please enter your mobile number', 'error')
      return
    }

    setStatus('loading')
    try {
      // Call forgetPassword API
      const response = await api.get<{ code: string; status: string; message: string }>(
        `auth/forgetPassword/${phoneNumber}`,
      )

      if (response.status === 'success') {
        setStatus('success')
        showToast(response.message || 'OTP sent successfully!', 'success')
        setOtpModalOpen(true)
      } else {
        throw new Error(response.message || 'Failed to send OTP')
      }
    } catch (error) {
      setStatus('error')
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP. Please try again.'
      showToast(errorMessage, 'error')
    }
  }

  const handleVerifyOtp = async (otp: string) => {
    try {
      const response = await api.post<
        { phoneNumber: string; otp: string },
        { code: string; status: string; message: string; token: string }
      >('auth/verifyForgottenOTP', {
        phoneNumber,
        otp,
      })

      if (response.status === 'success' && response.token) {
        setForgotPasswordToken(response.token)
        setOtpModalOpen(false)
        setPasswordModalOpen(true)
        showToast(response.message || 'OTP verified successfully!', 'success')
      } else {
        throw new Error(response.message || 'Invalid OTP')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid OTP. Please try again.'
      showToast(errorMessage, 'error')
    }
  }

  const handleSetPassword = async (password: string) => {
    if (!forgotPasswordToken) {
      showToast('Session expired. Please start again.', 'error')
      return
    }

    try {
      // Store token temporarily for this API call
      const savedOriginalToken = window.localStorage.getItem('connectingheart-token')
      setOriginalToken(savedOriginalToken)
      window.localStorage.setItem('connectingheart-token', forgotPasswordToken)

      const response = await api.post<
        { password: string },
        { code: string; status: string; message: string }
      >('auth/updateForgottenPassword', {
        password,
      })

      // Restore original token (or remove if there wasn't one)
      if (savedOriginalToken) {
        window.localStorage.setItem('connectingheart-token', savedOriginalToken)
      } else {
        window.localStorage.removeItem('connectingheart-token')
      }

      if (response.status === 'success') {
        showToast(response.message || 'Password updated successfully!', 'success')
        setPasswordModalOpen(false)
        setForgotPasswordToken(null)
        setOriginalToken(null)
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 1500)
      } else {
        throw new Error(response.message || 'Failed to update password')
      }
    } catch (error) {
      // Restore original token on error
      if (originalToken) {
        window.localStorage.setItem('connectingheart-token', originalToken)
      } else {
        window.localStorage.removeItem('connectingheart-token')
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password. Please try again.'
      showToast(errorMessage, 'error')
    }
  }

  return (
    <section className="section-shell">
      <div className="grid gap-8 lg:grid-cols-2">
        <div
          className="hidden min-h-[70vh] rounded-3xl bg-cover bg-center lg:block"
          style={{ backgroundImage: "url('/homeScreenPic.png')" }}
        />
        <AuthCard
          title="Forgot Password"
          subtitle="Enter your mobile number to receive an OTP for password reset."
          footer={
            <>
              Remember your password?{' '}
              <Link to="/login" className="font-semibold text-brand-500">
                Back to login
              </Link>
            </>
          }
        >
          <div className="space-y-4">
            <TextInput
              label="Mobile Number"
              type="tel"
              required
              placeholder="Enter your mobile number"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, ''))}
            />
            <Button
              size="lg"
              onClick={handleSendOtp}
              disabled={status === 'loading' || !phoneNumber.trim()}
            >
              {status === 'loading' ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </div>
        </AuthCard>
      </div>

      {/* OTP Verification Modal */}
      <OtpModal
        open={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onVerify={handleVerifyOtp}
      />

      {/* Set New Password Modal */}
      <SetNewPasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handleSetPassword}
      />

      {/* Toast Notifications */}
      <div className="pointer-events-none fixed top-6 right-6 z-50 space-y-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            onClose={() => dismissToast(toast.id)}
            duration={toast.variant === 'error' ? 4000 : 2000}
            className="pointer-events-auto"
          />
        ))}
      </div>
    </section>
  )
}

