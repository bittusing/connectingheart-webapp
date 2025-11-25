type StepCardProps = {
  step: number
  title: string
  description: string
}

export const StepCard = ({ step, title, description }: StepCardProps) => (
  <div className="glass-panel flex flex-col gap-3 lg:flex-row lg:items-start">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 font-display text-xl font-semibold text-white">
      {step}
    </div>
    <div>
      <p className="text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  </div>
)

