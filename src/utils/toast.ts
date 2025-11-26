type ToastVariant = 'success' | 'error'

export type ToastMessage = {
  id: string
  message: string
  variant: ToastVariant
}

type ToastListener = (toast: ToastMessage) => void

class ToastManager {
  private listeners: Set<ToastListener> = new Set()
  private toasts: ToastMessage[] = []

  subscribe(listener: ToastListener) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  show(message: string, variant: ToastVariant = 'error') {
    const id = globalThis.crypto?.randomUUID() ?? `${Date.now()}-${Math.random()}`
    const toast: ToastMessage = { id, message, variant }
    this.toasts.push(toast)
    
    // Notify all listeners
    this.listeners.forEach((listener) => listener(toast))
    
    // Auto-dismiss after duration
    const duration = variant === 'error' ? 4000 : 2000
    setTimeout(() => {
      this.dismiss(id)
    }, duration)
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id)
  }

  getToasts() {
    return [...this.toasts]
  }
}

export const toastManager = new ToastManager()

export const showToast = (message: string, variant: ToastVariant = 'error') => {
  toastManager.show(message, variant)
}

