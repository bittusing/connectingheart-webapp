import { cn } from '../../lib/cn'

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  alignment?: 'left' | 'center'
  className?: string
}

export const SectionHeading = ({
  eyebrow,
  title,
  subtitle,
  alignment = 'center',
  className,
}: SectionHeadingProps) => (
  <div
    className={cn(
      'space-y-4',
      alignment === 'center' && 'text-center',
      alignment === 'left' && 'text-left',
      className,
    )}
  >
    {eyebrow && (
      <span className="pill mx-auto text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-300">
        {eyebrow}
      </span>
    )}
    <div>
      <h2 className="font-display text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
          {subtitle}
        </p>
      )}
    </div>
  </div>
)

