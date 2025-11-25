import { MembershipPlanCard } from '../components/dashboard/MembershipPlanCard'
import { useMemberships } from '../hooks/useMemberships'

const formatExpiry = (isoDate: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoDate))

const SkeletonCard = () => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center justify-between">
      <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-5 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
    </div>
    <div className="mt-4 space-y-3">
      <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
    </div>
    <div className="mt-6 h-10 w-full animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
  </div>
)

export const MembershipPage = () => {
  const { plans, myMembership, heartCoins, isLoading, error } = useMemberships()
  const hasMembership = Boolean(myMembership)
  const expiryCopy = myMembership?.memberShipExpiryDate
    ? `Expires on ${formatExpiry(myMembership.memberShipExpiryDate)}`
    : 'Renew or upgrade anytime.'

  return (
    <section className="space-y-10">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Membership</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-white">
            Activate your plan
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Choose a plan that matches your family’s expectations. Upgrade anytime — your preferences stay intact.
          </p>
        </div>
        <div
          className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
            hasMembership
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200'
              : 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-100'
          }`}
        >
          {hasMembership ? (
            <div className="space-y-1">
              <p>Active plan: {myMembership?.planName}</p>
              {expiryCopy && <p className="text-xs font-normal opacity-80">{expiryCopy}</p>}
              <p className="text-xs font-normal opacity-80">{heartCoins} Heart Coins remaining</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p>No active membership</p>
              <p className="text-xs font-normal opacity-80">Unlock premium filters, heart coins, and faster matches.</p>
            </div>
          )}
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/50 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={`membership-skeleton-${index}`} />)
          : plans.map((plan) => <MembershipPlanCard key={plan.id} plan={plan} />)}
      </div>
    </section>
  )
}

