import { useState, useEffect, useRef } from 'react'
import { useApiClient } from './useApiClient'
import type { ApiProfileResponse, ApiProfile } from '../types/api'
import { transformApiProfiles } from '../utils/profileTransform'
import type { ProfileCardData } from '../types/dashboard'
import { useLookup } from './useLookup'
import { useCountryLookup } from './useCountryLookup'

type UseProfilesOptions = {
  page?: number
  pageSize?: number
  skipLocationLookups?: boolean // Skip city/state/country lookups if location is not displayed
}

type RefetchOptions = {
  silent?: boolean
}

type UseProfilesResult = {
  profiles: ProfileCardData[]
  allProfiles: ProfileCardData[] // All profiles without pagination
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
  const { fetchLookup, fetchStates, fetchCities } = useLookup()
  const { countries: countryOptions } = useCountryLookup()
  const [profiles, setProfiles] = useState<ProfileCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allProfiles, setAllProfiles] = useState<ProfileCardData[]>([])
  const { page = 1, pageSize = ITEMS_PER_PAGE, skipLocationLookups = false } = options
  const lookupCacheRef = useRef<{
    casteLabelMap: Record<string, string>
    countryLabelMap: Record<string, string>
    stateLabelMap: Record<string, string>
    cityLabelMap: Record<string, string>
  }>({
    casteLabelMap: {},
    countryLabelMap: {},
    stateLabelMap: {},
    cityLabelMap: {},
  })

  const fetchProfiles = async (options?: RefetchOptions) => {
    const silent = options?.silent ?? false
    try {
      if (!silent) {
        setLoading(true)
      }
      setError(null)

      // Fetch lookup data for caste labels (always needed as caste is displayed)
      let lookupData: Record<string, { label: string; value: string | number }[]> = {}
      try {
        lookupData = await fetchLookup()
      } catch {
        console.error('Failed to fetch lookup data for profiles')
      }

      // Build caste label map
      const casteOptions = lookupData.casts || []
      const casteLabelMap: Record<string, string> = {}
      casteOptions.forEach((option) => {
        if (option.value) {
          casteLabelMap[String(option.value)] = option.label
        }
      })
      lookupCacheRef.current.casteLabelMap = casteLabelMap

      // Build country label map (only if location lookups are needed)
      const countryLabelMap: Record<string, string> = {}
      if (!skipLocationLookups) {
        countryOptions.forEach((option) => {
          if (option.value) {
            countryLabelMap[String(option.value)] = option.label
          }
        })
        lookupCacheRef.current.countryLabelMap = countryLabelMap
      }

      const response = await get<ApiProfileResponse | ApiProfile[]>(endpoint)
      
      let profilesToTransform: ApiProfile[] = []
      
      // Handle direct array response (e.g., Profile Visitors)
      if (Array.isArray(response)) {
        profilesToTransform = response
      }
      // Handle wrapped response (e.g., All Profiles, Daily Recommendations)
      else if (response.status === 'success') {
        if (response.filteredProfiles) {
          profilesToTransform = response.filteredProfiles
        } else if (response.shortlistedProfilesData) {
          profilesToTransform = response.shortlistedProfilesData
        } else if (response.ignoreListData) {
          profilesToTransform = response.ignoreListData
        } else {
          throw new Error(response.message || 'No profile data found in response')
        }
      } else {
        throw new Error(response.message || 'Failed to fetch profiles')
      }

      // Fetch state and city labels for all profiles (only if location lookups are needed)
      const stateLabelMap: Record<string, string> = {}
      const cityLabelMap: Record<string, string> = {}

      if (!skipLocationLookups) {
        try {
          // Group required states by country
          const statesByCountry = new Map<string, Set<string>>()
          const citiesByState = new Map<string, Set<string>>()

          profilesToTransform.forEach((profile) => {
            if (profile.country && profile.state) {
              if (!statesByCountry.has(profile.country)) {
                statesByCountry.set(profile.country, new Set())
              }
              statesByCountry.get(profile.country)!.add(profile.state)
            }
            if (profile.state && profile.city) {
              if (!citiesByState.has(profile.state)) {
                citiesByState.set(profile.state, new Set())
              }
              citiesByState.get(profile.state)!.add(profile.city)
            }
          })

          // Resolve state labels
          for (const [countryId, stateCodes] of statesByCountry.entries()) {
            const stateOptions = await fetchStates(countryId)
            stateCodes.forEach((code) => {
              const match = stateOptions.find((opt) => String(opt.value) === String(code))
              if (match && match.value) {
                stateLabelMap[String(code)] = match.label
              }
            })
          }

          // Resolve city labels
          for (const [stateId, cityCodes] of citiesByState.entries()) {
            const cityOptions = await fetchCities(stateId)
            cityCodes.forEach((code) => {
              const match = cityOptions.find((opt) => String(opt.value) === String(code))
              if (match && match.value) {
                cityLabelMap[String(code)] = match.label
              }
            })
          }
        } catch (error) {
          console.error('Failed to resolve state/city labels for profiles', error)
        }

        lookupCacheRef.current.stateLabelMap = stateLabelMap
        lookupCacheRef.current.cityLabelMap = cityLabelMap
      }

      // Transform profiles and enrich with labels
      const transformedProfiles = transformApiProfiles(profilesToTransform).map((card, index) => {
        const source = profilesToTransform[index]
        if (!source) return card

        const casteCode = source.cast ? String(source.cast) : undefined
        const casteLabel = casteCode ? casteLabelMap[casteCode] : undefined

        // Only map location if lookups were performed
        let location = card.location
        if (!skipLocationLookups) {
          const cityLabel = source.city ? cityLabelMap[String(source.city)] : undefined
          const stateLabel = source.state ? stateLabelMap[String(source.state)] : undefined
          const countryLabel = source.country ? countryLabelMap[String(source.country)] : undefined

          const locationParts = [cityLabel, stateLabel, countryLabel].filter(Boolean)
          location = locationParts.length > 0 ? locationParts.join(', ') : card.location
        }

        return {
          ...card,
          caste: casteLabel ?? card.caste,
          location,
        }
      })

      setAllProfiles(transformedProfiles)
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
    allProfiles, // Return all profiles for infinite scroll
    loading,
    error,
    totalProfiles,
    currentPage: page,
    totalPages,
    refetch: fetchProfiles,
  }
}