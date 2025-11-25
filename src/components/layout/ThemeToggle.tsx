import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { useTheme } from '../../theme/ThemeProvider'

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:text-brand-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
    >
      {theme === 'light' ? (
        <MoonIcon className="h-5 w-5" />
      ) : (
        <SunIcon className="h-5 w-5" />
      )}
    </button>
  )
}

