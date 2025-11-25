import { useEffect } from 'react'
import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/solid'

type ToastVariant = 'success' | 'error'

type ToastProps = {
  message: string
  variant?: ToastVariant
  onClose: () => void
  duration?: number
  className?: string
}

export const Toast = ({
  message,
  variant = 'success',
  onClose,
  duration = 1000,
  className,
}: ToastProps) => {
  useEffect(() => {
    const timer = window.setTimeout(onClose, duration)
    return () => window.clearTimeout(timer)
  }, [duration, onClose])

  const isSuccess = variant === 'success'
  const iconClass = isSuccess ? 'text-emerald-500' : 'text-rose-500'
  const progressClass = isSuccess ? 'bg-emerald-400' : 'bg-rose-400'

  return (
    <div
      className={`min-w-[240px] rounded-2xl border border-white/70 bg-white p-4 text-sm text-slate-800 shadow-2xl shadow-slate-900/20 ${className ?? ''}`}
    >
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <CheckCircleIcon className={`h-5 w-5 ${iconClass}`} />
        ) : (
          <ExclamationTriangleIcon className={`h-5 w-5 ${iconClass}`} />
        )}
        <div className="flex-1 text-sm font-medium">{message}</div>
        <button
          type="button"
          aria-label="Dismiss notification"
          className="text-slate-400 transition hover:text-slate-600"
          onClick={onClose}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
      <div className={`mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100`}>
        <div className={`h-full w-full origin-left animate-toast-progress ${progressClass}`} />
      </div>
    </div>
  )
}


