import { useState, useEffect, useCallback } from 'react'
import { useApiClient } from './useApiClient'
import type { ApiProfileResponse } from '../types/api'

export const useJustJoinedCount = () => {
  const { get } = useApiClient()
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCount = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await get<ApiProfileResponse>('dashboard/getjustJoined')

      if (response.status === 'success' && response.filteredProfiles) {
        setCount(response.filteredProfiles.length)
      } else {
        setCount(0)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch just joined count'
      setError(errorMessage)
      console.error('Error fetching just joined count:', err)
      setCount(0)
    } finally {
      setLoading(false)
    }
  }, [get])

  useEffect(() => {
    fetchCount()
  }, [fetchCount])

  return {
    count,
    loading,
    error,
    refetch: fetchCount,
  }
}

