import { useState, useEffect, useCallback, useRef } from 'react'
import { useApiClient } from './useApiClient'
import type { ApiProfileResponse } from '../types/api'

export const useJustJoinedCount = () => {
  const { get } = useApiClient()
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)

  const fetchCount = useCallback(async () => {
    if (hasFetchedRef.current) return
    
    try {
      setLoading(true)
      setError(null)

      const response = await get<ApiProfileResponse>('dashboard/getjustJoined')

      if (response.status === 'success' && response.filteredProfiles) {
        setCount(response.filteredProfiles.length)
      } else {
        setCount(0)
      }
      hasFetchedRef.current = true
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
    if (!hasFetchedRef.current) {
      fetchCount()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  return {
    count,
    loading,
    error,
    refetch: fetchCount,
  }
}

