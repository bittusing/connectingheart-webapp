type StatHighlightProps = {
  label: string
  value: string
  detail?: string
}

export const StatHighlight = ({ label, value, detail }: StatHighlightProps) => (
  <div className="glass-panel space-y-3 text-center sm:text-left">
    <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
      {label}
    </p>
    <p className="font-display text-3xl font-semibold text-slate-900 dark:text-white">
      {value}
    </p>
    {detail && (
      <p className="text-sm text-slate-600 dark:text-slate-300">{detail}</p>
    )}
  </div>
)

