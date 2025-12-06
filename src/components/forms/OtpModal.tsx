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
          Verify OTP
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Check your Phone and Fill the OTP
        </p>
        <div className="mt-6 flex gap-2 justify-center">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              ref={index === 0 ? inputRef : undefined}
              type="text"
              maxLength={1}
              value={otp[index] || ''}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, '')
                if (value) {
                  const newOtp = otp.split('')
                  newOtp[index] = value
                  const updatedOtp = newOtp.join('').slice(0, 6)
                  setOtp(updatedOtp)
                  // Auto-focus next input
                  if (index < 5 && value) {
                    const nextInput = event.target.parentElement?.children[index + 1] as HTMLInputElement
                    nextInput?.focus()
                  }
                } else {
                  const newOtp = otp.split('')
                  newOtp[index] = ''
                  setOtp(newOtp.join(''))
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Backspace' && !otp[index] && index > 0) {
                  const prevInput = event.target.parentElement?.children[index - 1] as HTMLInputElement
                  prevInput?.focus()
                }
              }}
              className="w-12 h-12 rounded-xl border border-slate-200 text-center text-xl font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-500"
            />
          ))}
        </div>
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
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}

