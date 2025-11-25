import { Link } from 'react-router-dom'

export const BrandLogo = () => (
  <Link to="/" className="inline-flex items-center gap-2 font-display text-xl">
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg">
      ❤️
    </span>
    <div className="flex flex-col leading-4">
      <span className="text-base font-semibold text-slate-900 dark:text-white">
        ConnectingHeart
      </span>
      <span className="text-xs font-medium uppercase tracking-wide text-brand-500">
        Matrimony
      </span>
    </div>
  </Link>
)

