import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem('connectingheart-theme') as Theme
  if (stored) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  const applyThemeClass = useCallback((value: Theme) => {
    document.documentElement.classList.toggle('dark', value === 'dark')
  }, [])

  useEffect(() => {
    applyThemeClass(theme)
    window.localStorage.setItem('connectingheart-theme', theme)
  }, [applyThemeClass, theme])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (event: MediaQueryListEvent) =>
      setThemeState(event.matches ? 'dark' : 'light')

    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  const setTheme = useCallback(
    (value: Theme) => {
      setThemeState(value)
      applyThemeClass(value)
    },
    [applyThemeClass],
  )

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light'),
      setTheme,
    }),
    [setTheme, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

