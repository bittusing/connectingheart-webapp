import { useCallback } from 'react'
import { useApiClient } from './useApiClient'

export type NotificationType =
  | 'interestReceived'
  | 'interestSent'
  | 'unlockedProfiles'
  | 'iDeclined'
  | 'theyDeclined'
  | 'shortlistedProfile'
  | 'ignoredProfile'
  | 'blockedProfile'

type UpdateNotificationPayload = {
  ids: string[]
  type: NotificationType
}

type UpdateNotificationResponse = {
  status: string
  message: string
}

/**
 * Hook to update notification count when user visits a notification page
 * This marks the notifications as "seen" for the given type
 */
export const useUpdateNotificationCount = () => {
  const api = useApiClient()

  const updateNotificationCount = useCallback(
    async (ids: string[], type: NotificationType) => {
      if (!ids.length) return

      try {
        await api.post<UpdateNotificationPayload, UpdateNotificationResponse>(
          'dashboard/updateNotificationCount',
          { ids, type }
        )
      } catch (error) {
        // Silently fail - this is a background operation
        console.error('Failed to update notification count:', error)
      }
    },
    [api]
  )

  return { updateNotificationCount }
}

