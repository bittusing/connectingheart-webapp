import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/common/Button'
import { useDeleteProfile } from '../hooks/useDeleteProfile'

type ToastVariant = 'success' | 'error'

type ToastState = {
  message: string
  variant: ToastVariant
} | null

const reasons = [
  { id: 1, label: 'I found my match on Connecting Hearts' },
  { id: 2, label: 'I found my match elsewhere' },
  { id: 3, label: 'I am unhappy with services' },
  { id: 4, label: 'Marry later / create profile later' },
  { id: 5, label: 'I have to do some changes in my profile' },
  { id: 6, label: 'Privacy issues' },
  { id: 7, label: 'Other reasons' },
]

export const DeleteProfilePage = () => {
  const [selectedReason, setSelectedReason] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [toast, setToast] = useState<ToastState>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const { deleteProfile, isDeleting } = useDeleteProfile()

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
    if (!selectedReason) {
      const errorMessage = 'Please select a reason before continuing.'
      setFormError(errorMessage)
      showToast(errorMessage, 'error')
      return
    }

    setFormError(null)

    try {
      const response = await deleteProfile({
        reasonForDeletion: selectedReason,
        deletionComment: comment.trim() || 'No additional details provided.',
      })
      showToast(response?.message ?? 'Profile deleted successfully!', 'success')
      setComment('')
      setSelectedReason(null)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message.replace('API ', '') || 'Unable to delete profile.'
          : 'Unable to delete profile.'
      showToast(message, 'error')
    }
  }

  const selectedReasonLabel = useMemo(() => {
    if (!selectedReason) return ''
    return reasons.find((reason) => reason.id === selectedReason)?.label ?? ''
  }, [selectedReason])

  return (
    <>
      <section className="space-y-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-white">
            Delete Profile
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            This will permanently remove your account at Connecting Hearts. Let us know why before you
            proceed.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Why are you deleting your profile?
            </p>
            <div className="space-y-3">
              {reasons.map((reason) => (
                <label
                  key={reason.id}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-pink-200 dark:border-slate-700 dark:text-slate-200"
                >
                  <input
                    type="radio"
                    name="delete-reason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={() => setSelectedReason(reason.id)}
                    className="h-4 w-4 accent-pink-500"
                    aria-label={reason.label}
                  />
                  <span>{reason.label}</span>
                </label>
              ))}
            </div>
            {formError && <p className="text-xs font-semibold text-rose-500">{formError}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100" htmlFor="delete-comment">
              Additional comments (optional)
            </label>
            <textarea
              id="delete-comment"
              name="delete-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={300}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-inner focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white"
              placeholder="Share any feedback that could help us improve."
            />
            {selectedReasonLabel && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selected reason: {selectedReasonLabel}
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
            Deleting your profile clears matches, chat history, and access to premium benefits. This action cannot be
            undone.
          </div>

          <Button
            type="submit"
            size="lg"
            className="bg-rose-500 hover:bg-rose-600"
            disabled={isDeleting}
            fullWidth
          >
            {isDeleting ? 'Deleting...' : 'Delete profile permanently'}
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

