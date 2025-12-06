import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon, ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ProfileActionCard } from '../components/dashboard/ProfileActionCard'
import { useApiClient } from '../hooks/useApiClient'
import type { ApiProfile, ApiProfileResponse } from '../types/api'
import { transformApiProfiles } from '../utils/profileTransform'
import type { ProfileCardData } from '../types/dashboard'
import { useLookup } from '../hooks/useLookup'
import { useCountryLookup } from '../hooks/useCountryLookup'
import { useProfileActions } from '../hooks/useProfileActions'
import { showToast } from '../utils/toast'

type TabType = 'acceptedMe' | 'acceptedByMe'

export const AcceptancePage = () => {
  const navigate = useNavigate()
  const { get } = useApiClient()
  const { fetchLookup, fetchStates, fetchCities } = useLookup()
  const { countries: countryOptions } = useCountryLookup()
  const { declineInterest, pendingAction } = useProfileActions()
  const [activeTab, setActiveTab] = useState<TabType>('acceptedMe')
  const [profiles, setProfiles] = useState<ProfileCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true)
        setError(null)

        const endpoint = activeTab === 'acceptedMe' 
          ? 'dashboard/getAcceptanceProfiles/acceptedMe'
          : 'dashboard/getAcceptanceProfiles/acceptedByMe'

        // Fetch lookup data for caste/location labels
        let lookupData: Record<string, { label: string; value: string | number }[]> = {}
        try {
          lookupData = await fetchLookup()
        } catch {
          console.error('Failed to fetch lookup data')
        }

        // Build caste label map
        const casteOptions = lookupData.casts || []
        const casteLabelMap: Record<string, string> = {}
        casteOptions.forEach((option) => {
          if (option.value) {
            casteLabelMap[String(option.value)] = option.label
          }
        })

        // Build country label map
        const countryLabelMap: Record<string, string> = {}
        countryOptions.forEach((option) => {
          if (option.value) {
            countryLabelMap[String(option.value)] = option.label
          }
        })

        const response = await get<ApiProfileResponse | ApiProfile[]>(endpoint)
        let profilesArray: ApiProfile[] = []
        
        // Handle wrapped response (ApiProfileResponse)
        if (Array.isArray(response)) {
          profilesArray = response
        } else if (response.status === 'success' && response.filteredProfiles) {
          profilesArray = response.filteredProfiles
        } else {
          throw new Error(response.message || 'Failed to fetch profiles')
        }

        // Fetch state and city labels
        const stateLabelMap: Record<string, string> = {}
        const cityLabelMap: Record<string, string> = {}

        try {
          const statesByCountry = new Map<string, Set<string>>()
          const citiesByState = new Map<string, Set<string>>()

          profilesArray.forEach((profile) => {
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
          console.error('Failed to resolve state/city labels', error)
        }

        // Transform profiles and enrich with labels
        const transformedProfiles = transformApiProfiles(profilesArray).map((card, index) => {
          const source = profilesArray[index]
          if (!source) return card

          const casteCode = source.cast ? String(source.cast) : undefined
          const casteLabel = casteCode ? casteLabelMap[casteCode] : undefined

          const cityLabel = source.city ? cityLabelMap[String(source.city)] : undefined
          const stateLabel = source.state ? stateLabelMap[String(source.state)] : undefined
          const countryLabel = source.country ? countryLabelMap[String(source.country)] : undefined

          const locationParts = [cityLabel, stateLabel, countryLabel].filter(Boolean)

          return {
            ...card,
            caste: casteLabel ?? card.caste,
            location: locationParts.length > 0 ? locationParts.join(', ') : card.location,
          }
        })

        setProfiles(transformedProfiles)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profiles'
        setError(errorMessage)
        console.error('Error fetching acceptance profiles:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [activeTab, get, fetchLookup, fetchStates, fetchCities, countryOptions])

  const handleDeclined = async (profileId: string) => {
    try {
      const response = await declineInterest(profileId)
      showToast(response?.message || 'Interest declined successfully', 'success')
      // Remove declined profile from the list
      setProfiles((prev) => prev.filter((profile) => profile.id !== profileId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to decline interest'
      showToast(message, 'error')
    }
  }

  const handleChat = () => {
    showToast('Chat Coming Soon', 'success')
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 transition hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Go back"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Acceptance</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-2xl bg-white p-2 dark:bg-slate-800">
        <button
          onClick={() => setActiveTab('acceptedMe')}
          className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'acceptedMe'
              ? 'bg-pink-500 text-white shadow-md'
              : 'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          Accepted Me
        </button>
        <button
          onClick={() => setActiveTab('acceptedByMe')}
          className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'acceptedByMe'
              ? 'bg-pink-500 text-white shadow-md'
              : 'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          Accepted By Me
        </button>
      </div>

      {/* Content */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/50 dark:text-rose-200">
            {error}
          </div>
        ) : profiles.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              No profiles found in {activeTab === 'acceptedMe' ? 'Accepted Me' : 'Accepted By Me'}.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <ProfileActionCard
                key={profile.id}
                profile={profile}
                onSendInterest={undefined}
                onShortlist={undefined}
                onIgnore={undefined}
                hideButtons={false}
                dualButton={{
                  onAccept: handleChat,
                  onDecline: handleDeclined,
                  acceptLabel: 'Chat',
                  declineLabel: 'Declined',
                  acceptIcon: (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
                      <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                    </div>
                  ),
                  declineIcon: (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500">
                      <XMarkIcon className="h-6 w-6 text-white" />
                    </div>
                  ),
                }}
                pendingActionType={pendingAction?.type || null}
                pendingProfileId={pendingAction?.profileId || null}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

