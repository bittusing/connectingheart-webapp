import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { NotificationCounts } from '../hooks/useNotificationCounts'

type NotificationCountContextType = {
  counts: NotificationCounts
  loading: boolean
  refetch: () => void
}

export const NotificationCountContext = createContext<NotificationCountContextType | undefined>(undefined)

export const useNotificationCountContext = () => {
  const context = useContext(NotificationCountContext)
  if (!context) {
    throw new Error('useNotificationCountContext must be used within NotificationCountProvider')
  }
  return context
}

type NotificationCountProviderProps = {
  children: ReactNode
  counts: NotificationCounts
  loading: boolean
  refetch: () => void
}

export const NotificationCountProvider = ({
  children,
  counts,
  loading,
  refetch,
}: NotificationCountProviderProps) => {
  return (
    <NotificationCountContext.Provider value={{ counts, loading, refetch }}>
      {children}
    </NotificationCountContext.Provider>
  )
}

