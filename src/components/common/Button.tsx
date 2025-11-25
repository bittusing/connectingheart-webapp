import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  fullWidth?: boolean
}

export const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth,
  ...props
}: ButtonProps) => {
  const base =
    'inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

  const sizeStyles = {
    md: 'px-5 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  } satisfies Record<ButtonSize, string>

  const variantStyles = {
    primary:
      'bg-brand-600 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-500 focus-visible:outline-brand-500',
    secondary:
      'bg-white text-slate-900 shadow-lg shadow-slate-600/10 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-slate-500 dark:bg-slate-900 dark:text-white dark:ring-slate-700',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:outline-slate-500 dark:text-slate-200 dark:hover:bg-slate-800',
  } satisfies Record<ButtonVariant, string>

  return (
    <button
      className={cn(
        base,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {icon && <span className="mr-2 inline-flex">{icon}</span>}
      {children}
    </button>
  )
}

