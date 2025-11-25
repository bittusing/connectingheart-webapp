type MultiStepProgressProps = {
  current: number
  total: number
  label: string
}

export const MultiStepProgress = ({
  current,
  total,
  label,
}: MultiStepProgressProps) => {
  const percentage = Math.round((current / total) * 100)

  return (
    <div className="space-y-2">
      <div className="h-1.5 rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-pink-400 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-center text-xs font-medium text-slate-500">{label}</p>
    </div>
  )
}

