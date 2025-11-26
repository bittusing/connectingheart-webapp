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

// Permanent light mode - always return 'light'
const getInitialTheme = (): Theme => {
  return 'light'
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Force permanent light mode
  const [theme] = useState<Theme>('light')

  const applyThemeClass = useCallback((value: Theme) => {
    // Always ensure dark class is removed for permanent light mode
    document.documentElement.classList.remove('dark')
  }, [])

  useEffect(() => {
    // Always apply light theme on mount
    applyThemeClass('light')
    // Remove any stored theme preference
    window.localStorage.removeItem('connectingheart-theme')
  }, [applyThemeClass])

  // Disable theme switching - no-op functions
  const setTheme = useCallback(() => {
    // No-op: theme is permanently light
  }, [])

  const value = useMemo(
    () => ({
      theme: 'light' as const,
      toggleTheme: () => {
        // No-op: theme is permanently light
      },
      setTheme,
    }),
    [setTheme],
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

