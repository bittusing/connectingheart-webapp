import { useCallback, useEffect, useState } from 'react'
import { useApiClient } from './useApiClient'
import { useLookup } from './useLookup'
import { useCountryLookup } from './useCountryLookup'

type MyProfileApiData = {
  miscellaneous: {
    country: string
    state: string
    city: string
    heartsId: number
    profilePic: Array<{
      s3Link: string
      id: string
      primary: boolean
      _id: string
    }>
  }
  basic: {
    cast: string
    height: number
    country: string
    state: string
    city: string
    religion: string
    name: string
    income: number
    motherTongue: string
  }
  critical: {
    dob: string
    maritalStatus: string
  }
  about: {
    managedBy: string
    description?: string
    aboutYourself?: string
    disability?: string
    bodyType?: string
    thalassemia?: string
    hivPositive?: string
  }
  education: {
    qualification: string
    otherUGDegree: string
    aboutEducation?: string
    school?: string
  }
  career: {
    employed_in: string
    occupation: string
    aboutMyCareer?: string
    organisationName?: string
    interestedInSettlingAbroad?: string
  }
  family: {
    familyStatus: string
    familyValues: string
    familyType: string
    familyIncome: number | null
    fatherOccupation: string
    motherOccupation: string
    brothers: string
    marriedBrothers: string
    sisters: string
    marriedSisters: string
    gothra: string
    livingWithParents: string
    familyBasedOutOf: string
    aboutMyFamily?: string
    aboutFamily?: string
  }
  contact: {
    email: string
    phoneNumber: string
    alternateEmail?: string
    altMobileNumber?: string
    alternateMobileNo?: string
    alternateEmailId?: string
    landline?: string
  }
  horoscope: {
    manglik: string
    horoscope: string
    rashi?: string
    nakshatra?: string
    placeOfBirth?: string
    timeOfBirth?: string
    countryOfBirth?: string
    stateOfBirth?: string
    cityOfBirth?: string
  }
  lifeStyleData: {
    movies?: string
    languages: string[]
    foodICook?: string
    hobbies: string[]
    interest: string[]
    books: string[]
    dress: string[]
    sports: string[]
    cuisine: string[]
    favRead?: string
    favTVShow?: string
    vacayDestination?: string
    dietaryHabits: string
    drinkingHabits: string
    smokingHabits: string
    openToPets: string
    ownAHouse: string
    ownACar: string
    favMusic: string[]
  }
}

type MyProfileResponse = {
  code: string
  status: string
  data: MyProfileApiData
}

export type MyProfileData = MyProfileApiData & {
  enriched?: {
    countryLabel?: string
    stateLabel?: string
    cityLabel?: string
    castLabel?: string
    religionLabel?: string
    motherTongueLabel?: string
    qualificationLabel?: string
    employedInLabel?: string
    occupationLabel?: string
    interestedInSettlingAbroadLabel?: string
    maritalStatusLabel?: string
    manglikLabel?: string
    horoscopeLabel?: string
    rashiLabel?: string
    nakshatraLabel?: string
    fatherOccupationLabel?: string
    motherOccupationLabel?: string
    familyBasedOutOfLabel?: string
    managedByLabel?: string
    disabilityLabel?: string
    bodyTypeLabel?: string
    thalassemiaLabel?: string
    dietaryHabitsLabel?: string
    drinkingHabitsLabel?: string
    smokingHabitsLabel?: string
    languagesLabels?: string[]
    hobbiesLabels?: string[]
    interestLabels?: string[]
    booksLabels?: string[]
    dressLabels?: string[]
    sportsLabels?: string[]
    cuisineLabels?: string[]
    favMusicLabels?: string[]
  }
}

const mapCode = (options: Array<{ label: string; value: string }>, code: string | undefined | null): string | undefined => {
  if (!code) return undefined
  const option = options.find((opt) => String(opt.value) === String(code))
  return option?.label
}

const mapCodesArray = (options: Array<{ label: string; value: string }>, codes: string[] | undefined): string[] | undefined => {
  if (!codes || codes.length === 0) return undefined
  return codes.map((code) => mapCode(options, code)).filter((label): label is string => Boolean(label))
}

export const useMyProfileData = () => {
  const { get } = useApiClient()
  const { lookupData, fetchLookup, fetchStates, fetchCities } = useLookup()
  const { countries: countryOptions } = useCountryLookup()
  const [profile, setProfile] = useState<MyProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await get<MyProfileResponse>('personalDetails/getUserProfileData/')

      if (response.status === 'success' && response.data) {
        const apiData = response.data

        // Fetch lookup data
        const fetchedLookupData = await fetchLookup()
        const casts = fetchedLookupData.casts || []
        const religions = fetchedLookupData.religion || []
        const motherTongue = fetchedLookupData.motherTongue || fetchedLookupData.languages || []
        const qualifications = fetchedLookupData.highestEducation || fetchedLookupData.qualification || []
        const occupations = fetchedLookupData.occupation || []
        const employedInOptions = fetchedLookupData.employed_in || []
        const maritalStatuses = fetchedLookupData.maritalStatus || []
        const manglikOptions = fetchedLookupData.manglik || []
        const horoscopes = fetchedLookupData.horoscopes || fetchedLookupData.rashi || []
        const rashiOptions = fetchedLookupData.rashi || fetchedLookupData.horoscopes || []
        const nakshatraOptions = fetchedLookupData.nakshatra || []
        const managedByOptions = fetchedLookupData.managedBy || []
        const disabilityOptions = fetchedLookupData.disability || []
        const bodyTypeOptions = fetchedLookupData.bodyType || []
        const thalassemiaOptions = fetchedLookupData.thalassemia || []
        const dietaryHabitsOptions = fetchedLookupData.dietaryHabits || []
        const drinkingHabitsOptions = fetchedLookupData.drinkingHabits || []
        const smokingHabitsOptions = fetchedLookupData.smokingHabits || []
        const languages = fetchedLookupData.languages || fetchedLookupData.motherTongue || []
        const hobbies = fetchedLookupData.hobbies || []
        const interests = fetchedLookupData.interests || []
        const books = fetchedLookupData.books || []
        const dress = fetchedLookupData.dress || []
        const sports = fetchedLookupData.sports || []
        const cuisines = fetchedLookupData.cuisines || []
        const music = fetchedLookupData.music || []

        // Map location
        const countryLabel = mapCode(countryOptions, apiData.miscellaneous.country)
        let stateLabel: string | undefined
        let cityLabel: string | undefined

        if (apiData.miscellaneous.country) {
          try {
            const stateOptions = await fetchStates(apiData.miscellaneous.country)
            stateLabel = mapCode(stateOptions, apiData.miscellaneous.state)
            if (apiData.miscellaneous.state) {
              const cityOptions = await fetchCities(apiData.miscellaneous.state)
              cityLabel = mapCode(cityOptions, apiData.miscellaneous.city)
            }
          } catch {
            // If state/city lookups fail, keep undefined
          }
        }

        // Map family based out of
        let familyBasedOutOfLabel: string | undefined
        if (apiData.family.familyBasedOutOf) {
          familyBasedOutOfLabel = mapCode(countryOptions, apiData.family.familyBasedOutOf)
        }

        const enrichedProfile: MyProfileData = {
          ...apiData,
          enriched: {
            countryLabel,
            stateLabel,
            cityLabel,
            castLabel: mapCode(casts, apiData.basic.cast),
            religionLabel: mapCode(religions, apiData.basic.religion),
            motherTongueLabel: mapCode(motherTongue, apiData.basic.motherTongue),
            qualificationLabel: mapCode(qualifications, apiData.education.qualification),
            employedInLabel: mapCode(employedInOptions, apiData.career.employed_in),
            occupationLabel: mapCode(occupations, apiData.career.occupation),
            interestedInSettlingAbroadLabel:
              apiData.career.interestedInSettlingAbroad === 'Y'
                ? 'Yes'
                : apiData.career.interestedInSettlingAbroad === 'N'
                  ? 'No'
                  : undefined,
            maritalStatusLabel: mapCode(maritalStatuses, apiData.critical.maritalStatus),
            manglikLabel: mapCode(manglikOptions, apiData.horoscope.manglik),
            horoscopeLabel: mapCode(horoscopes, apiData.horoscope.horoscope),
            rashiLabel: mapCode(rashiOptions, apiData.horoscope.rashi),
            nakshatraLabel: mapCode(nakshatraOptions, apiData.horoscope.nakshatra),
            fatherOccupationLabel: mapCode(occupations, apiData.family.fatherOccupation),
            motherOccupationLabel: mapCode(occupations, apiData.family.motherOccupation),
            familyBasedOutOfLabel,
            managedByLabel: mapCode(managedByOptions, apiData.about.managedBy),
            disabilityLabel: mapCode(disabilityOptions, apiData.about.disability),
            bodyTypeLabel: mapCode(bodyTypeOptions, apiData.about.bodyType),
            thalassemiaLabel: mapCode(thalassemiaOptions, apiData.about.thalassemia),
            dietaryHabitsLabel: mapCode(dietaryHabitsOptions, apiData.lifeStyleData.dietaryHabits),
            drinkingHabitsLabel: mapCode(drinkingHabitsOptions, apiData.lifeStyleData.drinkingHabits),
            smokingHabitsLabel: mapCode(smokingHabitsOptions, apiData.lifeStyleData.smokingHabits),
            languagesLabels: mapCodesArray(languages, apiData.lifeStyleData.languages),
            hobbiesLabels: mapCodesArray(hobbies, apiData.lifeStyleData.hobbies),
            interestLabels: mapCodesArray(interests, apiData.lifeStyleData.interest),
            booksLabels: mapCodesArray(books, apiData.lifeStyleData.books),
            dressLabels: mapCodesArray(dress, apiData.lifeStyleData.dress),
            sportsLabels: mapCodesArray(sports, apiData.lifeStyleData.sports),
            cuisineLabels: mapCodesArray(cuisines, apiData.lifeStyleData.cuisine),
            favMusicLabels: mapCodesArray(music, apiData.lifeStyleData.favMusic),
          },
        }

        setProfile(enrichedProfile)
      } else {
        throw new Error('Failed to fetch profile data')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile data'
      setError(errorMessage)
      console.error('Error fetching my profile data:', err)
    } finally {
      setLoading(false)
    }
  }, [get, fetchLookup, fetchStates, fetchCities, countryOptions])

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  }
}

