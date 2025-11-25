import { type ReactNode } from 'react'

type AuthCardProps = {
  title: string
  subtitle: string
  footer: ReactNode
  children: ReactNode
}

export const AuthCard = ({
  title,
  subtitle,
  footer,
  children,
}: AuthCardProps) => (
  <section className="section-shell flex min-h-[70vh] flex-col items-center justify-center">
    <div className="glass-panel w-full max-w-xl space-y-8">
      <div className="space-y-2 text-center">
        <p className="pill mx-auto w-fit text-sm text-brand-600">
          Secure & private
        </p>
        <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-white">
          {title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">{subtitle}</p>
      </div>
      <div className="space-y-4">{children}</div>
      <div className="text-center text-sm text-slate-500 dark:text-slate-300">
        {footer}
      </div>
    </div>
  </section>
)

