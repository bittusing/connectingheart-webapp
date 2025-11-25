type FeatureCardProps = {
  title: string
  description: string
  icon: string
  accent?: string
}

export const FeatureCard = ({
  title,
  description,
  icon,
  accent = 'bg-brand-50 text-brand-600',
}: FeatureCardProps) => (
  <article className="glass-panel h-full space-y-4 text-left">
    <div
      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${accent}`}
    >
      {icon}
    </div>
    <div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </div>
  </article>
)

