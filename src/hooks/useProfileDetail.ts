import { useState, useEffect } from 'react'
import { useApiClient } from './useApiClient'
import { useLookup } from './useLookup'
import { useCountryLookup } from './useCountryLookup'
import type { ProfileDetailData, ProfileDetailResponse } from '../types/profileView'
import { transformProfileDetail } from '../utils/profileViewTransform'
import type { ProfileViewData } from '../types/profile'
import type { LookupDictionary, LookupOption } from '../types/api'

type UseProfileDetailResult = {
  profile: ProfileViewData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useProfileDetail = (profileId: string | undefined): UseProfileDetailResult => {
  const { get } = useApiClient()
  const { lookupData, fetchLookup, fetchStates, fetchCities } = useLookup()
  const { countries } = useCountryLookup()
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

      const response = await get<ProfileDetailResponse>(`dashboard/getDetailView/${profileId}`)

      if (response.status === 'success' && response.data) {
        const apiData = response.data
        const baseProfile = transformProfileDetail(apiData)
        setProfile(baseProfile)

        // Enrich labels in the background without blocking initial render
        void enrichProfileWithLookups({
          apiData,
          baseProfile,
          lookupData,
          fetchLookup,
          fetchStates,
          fetchCities,
          countries,
          onProfileUpdate: setProfile,
        })
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

type EnrichContext = {
  apiData: ProfileDetailData
  baseProfile: ProfileViewData
  lookupData: LookupDictionary
  fetchLookup: () => Promise<LookupDictionary>
  fetchStates: (countryId: string) => Promise<LookupOption[]>
  fetchCities: (stateId: string) => Promise<LookupOption[]>
  countries: LookupOption[]
  onProfileUpdate: (profile: ProfileViewData) => void
}

const mapCode = (options: LookupOption[] | undefined, code?: string): string | undefined => {
  if (!code || !options || options.length === 0) return code
  const normalizedCode = String(code).trim().toLowerCase()
  const match = options.find((option) => {
    const value = option.value !== undefined && option.value !== null ? String(option.value) : ''
    return value.trim().toLowerCase() === normalizedCode
  })
  return match?.label ?? code
}

const mapCodesArray = (options: LookupOption[] | undefined, codes?: string[]): string[] | undefined => {
  if (!codes || codes.length === 0) return undefined
  if (!options || options.length === 0) return codes
  const mapped = codes
    .map((code) => mapCode(options, code) || code)
    .filter((value) => Boolean(value)) as string[]
  return mapped.length ? mapped : undefined
}

const enrichProfileWithLookups = async (context: EnrichContext): Promise<void> => {
  const { apiData, baseProfile, lookupData, fetchLookup, fetchStates, fetchCities, countries, onProfileUpdate } =
    context

  try {
    const effectiveLookup =
      Object.keys(lookupData || {}).length > 0 ? lookupData : await fetchLookup().catch(() => ({} as LookupDictionary))

    const casts = effectiveLookup.casts
    const occupations = effectiveLookup.occupation
    const motherTongue = effectiveLookup.motherTongue || effectiveLookup.languages
    const cuisines = effectiveLookup.cuisines
    const hobbies = effectiveLookup.hobbies
    const interests = effectiveLookup.interests
    const sports = effectiveLookup.sports

    // Location enrichment
    const countryCode = apiData.miscellaneous.country
    const stateCode = apiData.miscellaneous.state
    const cityCode = apiData.miscellaneous.city

    const countryLabel = mapCode(countries, countryCode)

    let stateLabel: string | undefined
    let cityLabel: string | undefined

    if (countryCode) {
      try {
        const stateOptions = await fetchStates(countryCode)
        stateLabel = mapCode(stateOptions, stateCode)
        if (stateCode) {
          const cityOptions = await fetchCities(stateCode)
          cityLabel = mapCode(cityOptions, cityCode)
        }
      } catch {
        // If state/city lookups fail, keep existing labels
      }
    }

    const locationParts = [cityLabel, stateLabel, countryLabel].filter(Boolean)

    const enrichedProfile: ProfileViewData = {
      ...baseProfile,
      location: locationParts.length ? locationParts.join(', ') : baseProfile.location,
      caste: mapCode(casts, apiData.basic.cast) || baseProfile.caste,
      familyDetails: baseProfile.familyDetails && {
        ...baseProfile.familyDetails,
        fatherOccupation: mapCode(occupations, apiData.family.fatherOccupation) || baseProfile.familyDetails.fatherOccupation,
        motherOccupation: mapCode(occupations, apiData.family.motherOccupation) || baseProfile.familyDetails.motherOccupation,
      },
      lifestyleData: baseProfile.lifestyleData && {
        ...baseProfile.lifestyleData,
        languages: mapCodesArray(motherTongue, apiData.lifeStyleData.languages) || baseProfile.lifestyleData.languages,
        hobbies: mapCodesArray(hobbies, apiData.lifeStyleData.hobbies) || baseProfile.lifestyleData.hobbies,
        interest: mapCodesArray(interests, apiData.lifeStyleData.interest) || baseProfile.lifestyleData.interest,
        sports: mapCodesArray(sports, apiData.lifeStyleData.sports) || baseProfile.lifestyleData.sports,
        cuisine: mapCodesArray(cuisines, apiData.lifeStyleData.cuisine) || baseProfile.lifestyleData.cuisine,
      },
    }

    onProfileUpdate(enrichedProfile)
  } catch (error) {
    console.error('Failed to enrich profile detail with lookup data', error)
  }
}

