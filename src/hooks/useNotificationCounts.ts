import { useState, useEffect, useCallback } from 'react'
import { useApiClient } from './useApiClient'

export type NotificationCounts = {
  interestReceived: number
  interestSent: number
  unlockedProfiles: number
  iDeclined: number
  theyDeclined: number
  shortlisted: number
  ignored: number
  blocked: number
  total: number
}

type NotificationCountResponse = {
  code: string
  status: string
  message: string
  notificationCount?: number
  shortlistedProfilesData?: unknown[]
  ignoreListData?: unknown[]
  filteredProfiles?: unknown[]
}

export const useNotificationCounts = () => {
  const { get } = useApiClient()
  const [counts, setCounts] = useState<NotificationCounts>({
    interestReceived: 0,
    interestSent: 0,
    unlockedProfiles: 0,
    iDeclined: 0,
    theyDeclined: 0,
    shortlisted: 0,
    ignored: 0,
    blocked: 0,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCounts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [
        interestReceivedRes,
        interestSentRes,
        unlockedRes,
        iDeclinedRes,
        theyDeclinedRes,
        shortlistedRes,
        ignoredRes,
        blockedRes,
      ] = await Promise.all([
        get<NotificationCountResponse>('interest/getInterests'),
        get<NotificationCountResponse>('dashboard/getMyInterestedProfiles'),
        get<NotificationCountResponse>('dashboard/getMyUnlockedProfiles'),
        get<NotificationCountResponse>('dashboard/getMyDeclinedProfiles'),
        get<NotificationCountResponse>('dashboard/getUsersWhoHaveDeclinedMe'),
        get<NotificationCountResponse>('dashboard/getMyShortlistedProfiles'),
        get<NotificationCountResponse>('dashboard/getAllIgnoredProfiles'),
        get<NotificationCountResponse>('dashboard/getMyBlockedProfiles'),
      ])

      const getCount = (res: NotificationCountResponse | unknown[]): number => {
        if (Array.isArray(res)) {
          return res.length
        }
        if (res.shortlistedProfilesData) {
          return res.shortlistedProfilesData.length
        }
        if (res.ignoreListData) {
          return res.ignoreListData.length
        }
        if (res.filteredProfiles) {
          return res.filteredProfiles.length
        }
        return res.notificationCount || 0
      }

      const newCounts: NotificationCounts = {
        interestReceived: getCount(interestReceivedRes),
        interestSent: getCount(interestSentRes),
        unlockedProfiles: getCount(unlockedRes),
        iDeclined: getCount(iDeclinedRes),
        theyDeclined: getCount(theyDeclinedRes),
        shortlisted: getCount(shortlistedRes),
        ignored: getCount(ignoredRes),
        blocked: getCount(blockedRes),
        total: 0,
      }

      newCounts.total =
        newCounts.interestReceived +
        newCounts.interestSent +
        newCounts.unlockedProfiles +
        newCounts.iDeclined +
        newCounts.theyDeclined +
        newCounts.shortlisted +
        newCounts.ignored +
        newCounts.blocked

      setCounts(newCounts)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notification counts'
      setError(errorMessage)
      console.error('Error fetching notification counts:', err)
    } finally {
      setLoading(false)
    }
  }, [get])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  return {
    counts,
    loading,
    error,
    refetch: fetchCounts,
  }
}

