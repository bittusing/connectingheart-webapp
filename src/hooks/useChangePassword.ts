import { useCallback, useState } from 'react'
import { useApiClient } from './useApiClient'

type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

type ChangePasswordResponse = {
  code: string
  status: string
  message: string
}

export const useChangePassword = () => {
  const api = useApiClient()
  const [isUpdating, setIsUpdating] = useState(false)

  const changePassword = useCallback(
    async (payload: ChangePasswordPayload) => {
      setIsUpdating(true)
      try {
        const response = await api.patch<ChangePasswordPayload, ChangePasswordResponse>(
          '/api/auth/changePassword',
          payload,
        )
        return response
      } finally {
        setIsUpdating(false)
      }
    },
    [api],
  )

  return {
    changePassword,
    isUpdating,
  }
}


