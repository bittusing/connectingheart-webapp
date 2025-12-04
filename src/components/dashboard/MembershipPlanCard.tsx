import type { MembershipPlan } from '../../types/dashboard'
import { Button } from '../common/Button'

type MembershipPlanCardProps = {
  plan: MembershipPlan
  onBuyClick?: (membershipId: string) => void
  isProcessing?: boolean
}

export const MembershipPlanCard = ({ plan, onBuyClick, isProcessing }: MembershipPlanCardProps) => {
  const handleBuyClick = () => {
    if (onBuyClick && !isProcessing) {
      onBuyClick(plan.id)
    }
  }

  return (
    <article
      className={`rounded-3xl border p-6 shadow-sm transition ${
        plan.highlight
          ? 'border-pink-200 bg-pink-50 shadow-pink-100'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-slate-500">Plan</p>
          <h3 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
            {plan.name}
          </h3>
        </div>
        <span className="text-lg font-semibold text-pink-600">{plan.price}</span>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{plan.description}</p>
      <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
        {plan.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pink-500" />
            {perk}
          </li>
        ))}
      </ul>
      <Button
        className="mt-6 w-full"
        variant={plan.highlight ? 'primary' : 'secondary'}
        onClick={handleBuyClick}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : plan.cta ?? 'Upgrade now'}
      </Button>
    </article>
  )
}

