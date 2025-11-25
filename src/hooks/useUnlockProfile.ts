import { useCallback, useState } from 'react'
import { useApiClient } from './useApiClient'

type UnlockProfileError =
  | string
  | {
      msg?: string
      redirectToMembership?: boolean
    }

export type UnlockProfileResponse = {
  code: string
  status: 'success' | 'failed'
  message?: string
  err?: UnlockProfileError
}

export const useUnlockProfile = () => {
  const api = useApiClient()
  const [pendingProfileId, setPendingProfileId] = useState<string | null>(null)

  const unlockProfile = useCallback(
    async (profileId: string) => {
      setPendingProfileId(profileId)
      try {
        return await api.get<UnlockProfileResponse>(`dashboard/unlockProfile/${profileId}`)
      } finally {
        setPendingProfileId((current) => (current === profileId ? null : current))
      }
    },
    [api],
  )

  return {
    unlockProfile,
    isUnlocking: Boolean(pendingProfileId),
  }
}


