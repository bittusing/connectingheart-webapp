import { useCallback, useState } from 'react'
import { useApiClient } from './useApiClient'

type DeleteProfilePayload = {
  reasonForDeletion: number
  deletionComment: string
}

type DeleteProfileResponse = {
  code: string
  status: string
  message: string
}

export const useDeleteProfile = () => {
  const api = useApiClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteProfile = useCallback(
    async (payload: DeleteProfilePayload) => {
      setIsDeleting(true)
      try {
        const response = await api.delete<DeleteProfileResponse>('/auth/deleteProfile', {
          body: JSON.stringify(payload),
        })
        return response
      } finally {
        setIsDeleting(false)
      }
    },
    [api],
  )

  return {
    deleteProfile,
    isDeleting,
  }
}


