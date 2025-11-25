import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react'
import { cn } from '../../lib/cn'

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  icon?: ReactNode
  hint?: string
}

export const TextInput = forwardRef(function TextInput(
  { label, icon, hint, className, ...props }: TextInputProps,
  ref: Ref<HTMLInputElement>,
) {
  const showIcon = Boolean(icon)

  return (
    <label className="space-y-2 text-left">
      <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <div className="relative">
        {showIcon && icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-inner focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white',
            showIcon && 'pl-12',
            className,
          )}
          {...props}
        />
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </label>
  )
})

