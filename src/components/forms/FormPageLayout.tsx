import type { ReactNode } from 'react'

type FormPageLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
}

export const FormPageLayout = ({ title, subtitle, children }: FormPageLayoutProps) => {
  return (
    <section className="section-shell">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-2xl glass-panel space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="font-display text-3xl font-semibold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </section>
  )
}
