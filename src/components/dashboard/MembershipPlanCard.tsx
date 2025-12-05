import type { MembershipPlan } from '../../types/dashboard'

type MembershipPlanCardProps = {
  plan: MembershipPlan
  onBuyClick?: (membershipId: string) => void
  isProcessing?: boolean
}

// Get gradient and styling based on plan name
const getPlanStyles = (planName: string, isHighlight: boolean) => {
  const name = planName.toLowerCase()
  
  if (name.includes('gold')) {
    return {
      cardBg: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-400',
      border: 'border-amber-400/50',
      titleColor: 'text-slate-900',
      priceColor: 'text-pink-600',
      textColor: 'text-slate-800',
      bulletColor: 'bg-pink-600',
      buttonBg: 'bg-white hover:bg-slate-50',
      buttonText: 'text-slate-900',
    }
  }
  
  if (name.includes('platinum') || name.includes('premium')) {
    return {
      cardBg: 'bg-gradient-to-br from-purple-200 via-violet-300 to-purple-400',
      border: 'border-purple-400/50',
      titleColor: 'text-slate-900',
      priceColor: 'text-pink-600',
      textColor: 'text-slate-800',
      bulletColor: 'bg-pink-600',
      buttonBg: 'bg-white hover:bg-slate-50',
      buttonText: 'text-slate-900',
    }
  }
  
  if (name.includes('silver') || name.includes('basic')) {
    return {
      cardBg: 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300',
      border: 'border-slate-300',
      titleColor: 'text-slate-900',
      priceColor: 'text-pink-600',
      textColor: 'text-slate-700',
      bulletColor: 'bg-pink-500',
      buttonBg: 'bg-white hover:bg-slate-50',
      buttonText: 'text-slate-900',
    }
  }
  
  // Default/fallback styling
  if (isHighlight) {
    return {
      cardBg: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-400',
      border: 'border-amber-400/50',
      titleColor: 'text-slate-900',
      priceColor: 'text-pink-600',
      textColor: 'text-slate-800',
      bulletColor: 'bg-pink-600',
      buttonBg: 'bg-white hover:bg-slate-50',
      buttonText: 'text-slate-900',
    }
  }
  
  return {
    cardBg: 'bg-white dark:bg-slate-900',
    border: 'border-slate-200 dark:border-slate-800',
    titleColor: 'text-slate-900 dark:text-white',
    priceColor: 'text-pink-600',
    textColor: 'text-slate-600 dark:text-slate-300',
    bulletColor: 'bg-pink-500',
    buttonBg: 'bg-pink-500 hover:bg-pink-600',
    buttonText: 'text-white',
  }
}

export const MembershipPlanCard = ({ plan, onBuyClick, isProcessing }: MembershipPlanCardProps) => {
  const handleBuyClick = () => {
    if (onBuyClick && !isProcessing) {
      onBuyClick(plan.id)
    }
  }

  const styles = getPlanStyles(plan.name, plan.highlight)

  return (
    <article
      className={`rounded-3xl border p-6 shadow-lg transition ${styles.cardBg} ${styles.border}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm uppercase tracking-widest ${styles.textColor} opacity-70`}>Plan</p>
          <h3 className={`font-display text-2xl font-bold ${styles.titleColor}`}>
            {plan.name}
          </h3>
        </div>
        <span className={`text-lg font-bold ${styles.priceColor}`}>{plan.price}</span>
      </div>
      <p className={`mt-2 text-sm ${styles.textColor}`}>{plan.description}</p>
      <ul className={`mt-4 space-y-2 text-sm ${styles.textColor}`}>
        {plan.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2">
            <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${styles.bulletColor}`} />
            {perk}
          </li>
        ))}
      </ul>
      <button
        className={`mt-6 w-full rounded-full px-6 py-3 text-sm font-semibold shadow-md transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${styles.buttonBg} ${styles.buttonText}`}
        onClick={handleBuyClick}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : plan.cta ?? 'Choose plan'}
      </button>
    </article>
  )
}

