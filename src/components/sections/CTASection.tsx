import { Link } from 'react-router-dom'
import { Button } from '../common/Button'

export const CTASection = () => (
  <section id="plans" className="section-shell">
    <div className="glass-panel flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
      <div className="flex-1 space-y-4">
        <p className="pill">Ready to start?</p>
        <h3 className="font-display text-3xl font-semibold text-slate-900 dark:text-white">
          Build your ConnectingHeart profile in under five minutes.
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Post-launch we will switch the static flows to live APIs. Your
          progress will stay synced across devices and caretakers you invite.
        </p>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        <Link to="/register">
          <Button size="lg">Create profile</Button>
        </Link>
        <Link to="/login">
          <Button size="lg" variant="ghost">
            Access dashboard
          </Button>
        </Link>
      </div>
    </div>
  </section>
)

