import { Button } from '../common/Button'

type PricingCardProps = {
  name: string
  price: string
  caption: string
  perks: string[]
  highlight?: boolean
}

export const PricingCard = ({
  name,
  price,
  caption,
  perks,
  highlight,
}: PricingCardProps) => (
  <div
    className={`glass-panel h-full space-y-6 ${highlight ? 'border-brand-200 bg-white shadow-floating dark:border-brand-500/20 dark:bg-slate-900' : ''}`}
  >
    <div className="space-y-1">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
        {name}
      </p>
      <p className="font-display text-3xl font-semibold text-slate-900 dark:text-white">
        {price}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-300">{caption}</p>
    </div>
    <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
      {perks.map((perk) => (
        <li key={perk} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-500" />
          {perk}
        </li>
      ))}
    </ul>
    <Button variant={highlight ? 'primary' : 'secondary'} fullWidth>
      Choose {name}
    </Button>
  </div>
)

