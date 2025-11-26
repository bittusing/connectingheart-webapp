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
      } catch (error) {
        console.log("error",error);
        if (error instanceof Error && (error as any).redirectToMembership) {
          return {
            code: 'CH400',
            status: 'failed',
            message: 'Please renew your membership in order to unlock further profiles.',
            err: { redirectToMembership: true }
          }
        }
        throw error
      } finally {
        setPendingProfileId((current) => (current === profileId ? null : current))
      }
    },
    [api],
  )

  return {
    unlockProfile,
    isUnlocking: Boolean(pendingProfileId),
    redirectToMembership: Boolean(pendingProfileId),
  }
}


