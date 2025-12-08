import { useState, useEffect } from 'react'
import { useApiClient } from './useApiClient'
import type { ProfileDetailData, ProfileDetailResponse } from '../types/profileView'
import { transformProfileDetailV1 } from '../utils/profileDetailTransform'
import type { ProfileViewData } from '../types/profile'

type UseProfileDetailResult = {
  profile: ProfileViewData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useProfileDetail = (profileId: string | undefined): UseProfileDetailResult => {
  const { get } = useApiClient()
  const [profile, setProfile] = useState<ProfileViewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfileDetail = async () => {
    if (!profileId) {
      setError('Profile ID is required')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Use new endpoint getDetailView1
      const response = await get<ProfileDetailResponse>(`dashboard/getDetailView1/${profileId}`)

      if (response.code === 'CH200' && response.status === 'success' && response.data) {
        const apiData = response.data
        // Transform directly without lookup calls - all data is already formatted
        const transformedProfile = transformProfileDetailV1(apiData)
        setProfile(transformedProfile)
      } else {
        throw new Error('Failed to fetch profile details')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile'
      setError(errorMessage)
      console.error('Error fetching profile detail:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfileDetail,
  }
}


