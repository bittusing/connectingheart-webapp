import { useState, useEffect } from 'react'
import { useApiClient } from './useApiClient'
import type { ApiProfileResponse, ApiProfile } from '../types/api'
import { transformApiProfiles } from '../utils/profileTransform'
import type { ProfileCardData } from '../types/dashboard'

type UseProfilesOptions = {
  page?: number
  pageSize?: number
}

type RefetchOptions = {
  silent?: boolean
}

type UseProfilesResult = {
  profiles: ProfileCardData[]
  loading: boolean
  error: string | null
  totalProfiles: number
  currentPage: number
  totalPages: number
  refetch: (options?: RefetchOptions) => Promise<void>
}

const ITEMS_PER_PAGE = 9 // 3 columns x 3 rows

export const useProfiles = (
  endpoint: string,
  options: UseProfilesOptions = {},
): UseProfilesResult => {
  const { get } = useApiClient()
  const [profiles, setProfiles] = useState<ProfileCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allProfiles, setAllProfiles] = useState<ProfileCardData[]>([])
  const { page = 1, pageSize = ITEMS_PER_PAGE } = options

  const fetchProfiles = async (options?: RefetchOptions) => {
    const silent = options?.silent ?? false
    try {
      if (!silent) {
        setLoading(true)
      }
      setError(null)
      const response = await get<ApiProfileResponse | ApiProfile[]>(endpoint)
      
      // Handle direct array response (e.g., Profile Visitors)
      if (Array.isArray(response)) {
        const transformedProfiles = transformApiProfiles(response)
        setAllProfiles(transformedProfiles)
      }
      // Handle wrapped response (e.g., All Profiles, Daily Recommendations)
      else if (response.status === 'success') {
        let profilesToTransform: ApiProfile[] = []
        
        if (response.filteredProfiles) {
          profilesToTransform = response.filteredProfiles
        } else if (response.shortlistedProfilesData) {
          profilesToTransform = response.shortlistedProfilesData
        } else if (response.ignoreListData) {
          profilesToTransform = response.ignoreListData
        } else {
          throw new Error(response.message || 'No profile data found in response')
        }
        
        const transformedProfiles = transformApiProfiles(profilesToTransform)
        setAllProfiles(transformedProfiles)
      } else {
        throw new Error(response.message || 'Failed to fetch profiles')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profiles'
      setError(errorMessage)
      console.error('Error fetching profiles:', err)
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchProfiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]) // Only refetch when endpoint changes, not on page change

  // Client-side pagination
  useEffect(() => {
    if (allProfiles.length > 0) {
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedProfiles = allProfiles.slice(startIndex, endIndex)
      setProfiles(paginatedProfiles)
    } else {
      setProfiles([])
    }
  }, [allProfiles, page, pageSize])

  const totalProfiles = allProfiles.length
  const totalPages = Math.ceil(totalProfiles / pageSize)

  return {
    profiles,
    loading,
    error,
    totalProfiles,
    currentPage: page,
    totalPages,
    refetch: fetchProfiles,
  }
}