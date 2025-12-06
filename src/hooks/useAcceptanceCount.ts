import { useCallback, useEffect, useState } from 'react'
import { useApiClient } from './useApiClient'
import type { ApiProfileResponse } from '../types/api'

export const useAcceptanceCount = () => {
  const { get } = useApiClient()
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCount = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch both endpoints in parallel
      const [acceptedMeRes, acceptedByMeRes] = await Promise.all([
        get<ApiProfileResponse | unknown[]>('dashboard/getAcceptanceProfiles/acceptedMe'),
        get<ApiProfileResponse | unknown[]>('dashboard/getAcceptanceProfiles/acceptedByMe'),
      ])

      // Helper to get count from response
      const getCount = (res: ApiProfileResponse | unknown[]): number => {
        if (Array.isArray(res)) {
          return res.length
        }
        const apiResponse = res as ApiProfileResponse
        if (apiResponse.filteredProfiles && Array.isArray(apiResponse.filteredProfiles)) {
          return apiResponse.filteredProfiles.length
        }
        return 0
      }

      const acceptedMeCount = getCount(acceptedMeRes)
      const acceptedByMeCount = getCount(acceptedByMeRes)
      const totalCount = acceptedMeCount + acceptedByMeCount

      setCount(totalCount)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch acceptance count'
      setError(errorMessage)
      console.error('Error fetching acceptance count:', err)
      setCount(0)
    } finally {
      setLoading(false)
    }
  }, [get])

  useEffect(() => {
    void fetchCount()
  }, [fetchCount])

  return {
    count,
    loading,
    error,
    refetch: fetchCount,
  }
}

