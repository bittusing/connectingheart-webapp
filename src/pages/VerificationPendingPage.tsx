import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'

export const VerificationPendingPage = () => (
  <section className="section-shell flex min-h-[70vh] flex-col items-center justify-center text-center">
    <div className="mx-auto h-32 w-32 rounded-full bg-pink-50 text-5xl leading-[8rem]">
      🔒
    </div>
    <h1 className="mt-8 font-display text-4xl font-semibold text-slate-900">
      Verification Pending
    </h1>
    <p className="mt-4 max-w-xl text-sm text-slate-500">
      Your ID is under verification. It might take 15 to 20 days for approval. You can resume the
      experience once the profile is verified.
    </p>
    <Link to="/login" className="mt-10 inline-flex">
      <Button size="lg">Back to login</Button>
    </Link>
  </section>
)

