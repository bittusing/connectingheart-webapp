import { useCallback } from 'react'
import { useApiClient } from './useApiClient'

type UpdateResponse = {
  code?: string
  status: string
  message?: string
}

export const useUpdateLastActiveScreen = () => {
  const api = useApiClient()

  const updateLastActiveScreen = useCallback(
    async (screenName: string) => {
      if (!screenName) return

      try {
        await api.request<UpdateResponse>(`/auth/updateLastActiveScreen/${screenName}`, {
          method: 'PATCH',
        })
      } catch (error) {
        console.error('Failed to update last active screen', error)
      }
    },
    [api],
  )

  return { updateLastActiveScreen }
}


