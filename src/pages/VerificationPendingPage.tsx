import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'

export const VerificationPendingPage = () => (
  <section className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-10 text-center">
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 rounded-3xl bg-white">
      <img
        src="/verification.5ff110454d7ca6038318.png"
        alt="Verification pending illustration"
        className="h-40 w-auto"
        loading="lazy"
      />
      <div className="space-y-3">
        <h1 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
          Verification Pending
        </h1>
        <p className="mx-auto max-w-lg text-sm text-slate-600">
          Your ID is under verification. It might take 15 to 20 days for verification. You can use the
          services once it is verified.
        </p>
      </div>
      <Link to="/login" className="mt-4 inline-flex">
        <Button size="lg" className="px-10">
          Back to Login
        </Button>
      </Link>
    </div>
  </section>
)

