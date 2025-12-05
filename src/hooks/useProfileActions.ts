import { useCallback, useState } from 'react'
import { useApiClient } from './useApiClient'

type ApiResponse = {
  code: string
  status: string
  message: string
}

export type ProfileActionType =
  | 'send-interest'
  | 'unsend-interest'
  | 'accept-interest'
  | 'accept-again'
  | 'decline-interest'
  | 'shortlist'
  | 'unshortlist'
  | 'ignore'
  | 'unignore'
  | 'unblock'

export const useProfileActions = () => {
  const api = useApiClient()
  const [pendingAction, setPendingAction] = useState<{ type: ProfileActionType; profileId: string } | null>(null)

  const runAction = useCallback(
    async (type: ProfileActionType, profileId: string, request: () => Promise<ApiResponse>) => {
      setPendingAction({ type, profileId })
      try {
        return await request()
      } finally {
        setPendingAction((current) => {
          if (current?.type === type && current.profileId === profileId) {
            return null
          }
          return current
        })
      }
    },
    [],
  )

  const sendInterest = useCallback(
    (targetId: string) =>
      runAction('send-interest', targetId, () =>
        api.post<{ targetId: string }, ApiResponse>('interest/sendInterest', { targetId }),
      ),
    [api, runAction],
  )

  const unsendInterest = useCallback(
    (targetId: string) =>
      runAction('unsend-interest', targetId, () =>
        api.post<{ targetId: string }, ApiResponse>('interest/unsendInterest', { targetId }),
      ),
    [api, runAction],
  )

  const acceptInterest = useCallback(
    (profileId: string) =>
      runAction('accept-interest', profileId, () =>
        api.post<{ _id: string; status: string }, ApiResponse>('interest/updateInterest', {
          _id: profileId,
          status: 'accept',
        }),
      ),
    [api, runAction],
  )

  const declineInterest = useCallback(
    (profileId: string) =>
      runAction('decline-interest', profileId, () =>
        api.post<{ _id: string; status: string }, ApiResponse>('interest/updateInterest', {
          _id: profileId,
          status: 'reject',
        }),
      ),
    [api, runAction],
  )

  const shortlistProfile = useCallback(
    (profileId: string) =>
      runAction('shortlist', profileId, () => api.get<ApiResponse>(`dashboard/shortlist/${profileId}`)),
    [api, runAction],
  )

  const unshortlistProfile = useCallback(
    (profileId: string) =>
      runAction('unshortlist', profileId, () => api.get<ApiResponse>(`dashboard/unshortlist/${profileId}`)),
    [api, runAction],
  )

  const ignoreProfile = useCallback(
    (profileId: string) =>
      runAction('ignore', profileId, () => api.get<ApiResponse>(`dashboard/ignoreProfile/${profileId}`)),
    [api, runAction],
  )

  const unignoreProfile = useCallback(
    (profileId: string) =>
      runAction('unignore', profileId, () => api.get<ApiResponse>(`dashboard/unIgnoreProfile/${profileId}`)),
    [api, runAction],
  )

  const unblockProfile = useCallback(
    (profileId: string) =>
      runAction('unblock', profileId, () => api.get<ApiResponse>(`dashboard/unblockprofile/${profileId}`)),
    [api, runAction],
  )

  return {
    sendInterest,
    unsendInterest,
    acceptInterest,
    declineInterest,
    shortlistProfile,
    unshortlistProfile,
    ignoreProfile,
    unignoreProfile,
    unblockProfile,
    pendingAction,
  }
}


