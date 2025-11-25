import { useEffect, useState, useCallback } from 'react'
import { useApiClient } from './useApiClient'
import type { LookupDictionary, LookupResponse } from '../types/api'

type UseLookupOptionsResult = {
  options: LookupDictionary | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useLookupOptions = (): UseLookupOptionsResult => {
  const { get } = useApiClient()
  const [options, setOptions] = useState<LookupDictionary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLookup = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await get<LookupResponse>('lookup')

      if (response.status !== 'success' || !response.lookupData?.length) {
        throw new Error(response.message || 'Failed to load lookup data')
      }

      setOptions(response.lookupData[0])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to fetch lookup data'
      setError(message)
      console.error('Lookup fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }, [get])

  useEffect(() => {
    fetchLookup()
  }, [fetchLookup])

  return {
    options,
    loading,
    error,
    refetch: fetchLookup,
  }
}

