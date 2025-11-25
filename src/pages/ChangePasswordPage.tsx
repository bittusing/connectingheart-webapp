import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/common/Button'
import { TextInput } from '../components/forms/TextInput'
import { useChangePassword } from '../hooks/useChangePassword'

type ToastVariant = 'success' | 'error'

type ToastState = {
  message: string
  variant: ToastVariant
} | null

const initialFormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export const ChangePasswordPage = () => {
  const [form, setForm] = useState(initialFormState)
  const [toast, setToast] = useState<ToastState>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const { changePassword, isUpdating } = useChangePassword()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const showToast = (message: string, variant: ToastVariant) => {
    setToast({ message, variant })
  }

  useEffect(() => {
    if (!toast) {
      return undefined
    }
    const timer = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      const mismatchMessage = 'New password and confirmation must match.'
      setFieldError(mismatchMessage)
      showToast(mismatchMessage, 'error')
      return
    }

    setFieldError(null)
    try {
      const response = await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      showToast(response?.message ?? 'Password updated successfully.', 'success')
      setForm(initialFormState)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message.replace('API ', '') || 'Unable to update password.'
          : 'Unable to update password.'
      showToast(message, 'error')
    }
  }

  const passwordStrengthHint = useMemo(() => {
    if (!form.newPassword) {
      return 'Use at least 8 characters with letters, numbers, and symbols.'
    }
    if (form.newPassword.length < 8) {
      return 'Too short — aim for 8 characters or more.'
    }
    return undefined
  }, [form.newPassword])

  return (
    <>
      <section className="space-y-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Security</p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-white">
                Change Password
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Keep your account protected. Use a strong password that includes a combination of
                letters, numbers, and special characters.
              </p>
            </div>
            <div className="flex h-32 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 lg:w-60">
              <svg
                className="h-16 w-16 text-pink-500 dark:text-pink-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
        </header>
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <TextInput
            label="Current Password"
            type="password"
            name="currentPassword"
            autoComplete="current-password"
            required
            value={form.currentPassword}
            onChange={handleChange}
          />
          <TextInput
            label="New Password"
            type="password"
            name="newPassword"
            autoComplete="new-password"
            required
            value={form.newPassword}
            onChange={handleChange}
            hint={passwordStrengthHint}
          />
          <div className="space-y-2">
            <TextInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {fieldError && <p className="text-xs font-semibold text-rose-500">{fieldError}</p>}
          </div>
          <Button size="lg" fullWidth type="submit" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update password'}
          </Button>
        </form>
      </section>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            role="status"
            aria-live="polite"
            className={`flex items-start gap-3 rounded-2xl px-5 py-4 text-sm shadow-2xl ${
              toast.variant === 'success'
                ? 'bg-emerald-500/90 text-white'
                : 'bg-rose-500/90 text-white'
            }`}
          >
            <div className="flex-1">
              <p className="font-semibold">{toast.variant === 'success' ? 'Success' : 'Heads up'}</p>
              <p>{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="rounded-full p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}