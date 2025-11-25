import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { Button } from '../components/common/Button'
import { useApiClient } from '../hooks/useApiClient'

type FeedbackResponse = {
  code: string
  status: string
  message: string
}

export const FeedbackPage = () => {
  const navigate = useNavigate()
  const api = useApiClient()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (rating === 0) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await api.post<{ rating: number; comment: string }, FeedbackResponse>(
        'dashboard/submitReview',
        {
          rating,
          comment: comment.trim() || '',
        },
      )

      if (response.status === 'success') {
        setSuccess(true)
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          navigate('/dashboard', { replace: true })
        }, 1500)
      } else {
        throw new Error(response.message || 'Failed to submit feedback')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit feedback'
      setError(errorMessage)
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-8">
      <header className="text-center">
        <h1 className="font-display text-4xl font-semibold text-slate-900 dark:text-white">
          Feedback
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Rate Your Experience
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">Your Voice, Our Growth</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  {star <= (hoveredRating || rating) ? (
                    <StarIcon className="h-10 w-10 text-yellow-400" />
                  ) : (
                    <StarOutlineIcon className="h-10 w-10 text-slate-300" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Comment</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comment"
              rows={6}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
            />
          </label>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Thank you for your feedback! Redirecting to dashboard...
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={rating === 0 || isSubmitting || success}
            className="bg-pink-500 font-semibold shadow-lg shadow-pink-500/30 hover:bg-pink-600"
          >
            {isSubmitting ? 'Submitting...' : success ? 'Submitted!' : 'Submit Your Rating'}
          </Button>
        </div>
      </form>
    </section>
  )
}