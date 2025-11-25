import { useEffect, useState, useCallback } from 'react'
import { useApiClient } from './useApiClient'
import { transformApiProfiles } from '../utils/profileTransform'
import type { ProfileSearchPayload } from '../types/api'
import type { ProfileCardData } from '../types/dashboard'
import type { ApiProfileResponse } from '../types/api'

type UseSearchProfilesResult = {
  profiles: ProfileCardData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useSearchProfiles = (
  payload: ProfileSearchPayload | null,
): UseSearchProfilesResult => {
  const { post } = useApiClient()
  const [profiles, setProfiles] = useState<ProfileCardData[]>([])
  const [loading, setLoading] = useState<boolean>(Boolean(payload))
  const [error, setError] = useState<string | null>(null)

  const fetchProfiles = useCallback(async () => {
    if (!payload) {
      setProfiles([])
      setLoading(false)
      setError('No search filters provided. Please start a search first.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await post<ProfileSearchPayload, ApiProfileResponse>(
        'dashboard/searchProfile',
        payload,
      )

      if (response.status === 'success' && response.filteredProfiles) {
        const transformed = transformApiProfiles(response.filteredProfiles)
        setProfiles(transformed)
      } else {
        throw new Error(response.message || 'Failed to fetch search results')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to fetch search results'
      setError(message)
      console.error('Profile search failed:', err)
    } finally {
      setLoading(false)
    }
  }, [payload, post])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles,
  }
}

