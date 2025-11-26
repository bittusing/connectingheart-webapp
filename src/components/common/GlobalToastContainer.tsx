import { useEffect, useState } from 'react'
import { Toast } from './Toast'
import { toastManager, type ToastMessage } from '../../utils/toast'

export const GlobalToastContainer = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((toast) => {
      setToasts((prev) => [...prev, toast])
    })

    // Load existing toasts
    setToasts(toastManager.getToasts())

    return unsubscribe
  }, [])

  const dismissToast = (toastId: string) => {
    toastManager.dismiss(toastId)
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId))
  }

  return (
    <div className="pointer-events-none fixed top-6 right-6 z-[100] space-y-3">
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
  )
}


