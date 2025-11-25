import { useEffect, useRef, useState } from 'react'
import { Button } from '../common/Button'

type OtpModalProps = {
  open: boolean
  onClose: () => void
  onVerify: (otp: string) => void
}

export const OtpModal = ({ open, onClose, onVerify }: OtpModalProps) => {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setOtp('')
      setError(null)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  if (!open) return null

  const handleVerify = () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP sent to your phone.')
      return
    }
    onVerify(otp)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <h3 className="font-display text-2xl font-semibold text-slate-900">
          Enter OTP
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          We sent a 6-digit verification code to your mobile number.
        </p>
        <input
          ref={inputRef}
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
          className="mt-6 w-full rounded-2xl border border-slate-200 px-4 py-3 text-center text-2xl tracking-[0.3em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-500"
          placeholder="••••••"
        />
        {error && <p className="mt-2 text-sm text-pink-600">{error}</p>}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            className="text-sm font-semibold text-slate-500 hover:text-slate-700"
            onClick={onClose}
          >
            Cancel
          </button>
          <Button size="lg" onClick={handleVerify}>
            Verify OTP
          </Button>
        </div>
      </div>
    </div>
  )
}

