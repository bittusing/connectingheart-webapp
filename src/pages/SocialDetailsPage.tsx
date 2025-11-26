import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { SelectButton, ToggleGroup } from '../components/forms/FormComponents'
import { SelectModal } from '../components/forms/SelectModal'
import { useApiClient } from '../hooks/useApiClient'
import { useUpdateLastActiveScreen } from '../hooks/useUpdateLastActiveScreen'
import { useUserProfile } from '../hooks/useUserProfile'
import { useLookup } from '../hooks/useLookup'
import { showToast } from '../utils/toast'

type GetUserResponse = {
  code: string
  status: string
  message: string
  data: {
    _id: string
    screenName?: string
    [key: string]: any
  }
}

type PickerField = 'motherTongue' | 'caste' | 'horoscope' | 'manglik'

export const SocialDetailsPage = () => {
  const navigate = useNavigate()
  const api = useApiClient()
  const { updateLastActiveScreen } = useUpdateLastActiveScreen()
  const { profile, loading: profileLoading } = useUserProfile()
  const { fetchLookup, lookupData } = useLookup()

  const [formData, setFormData] = useState({
    maritalStatus: 'Never married',
    motherTongue: '',
    religion: 'Hindu',
    cast: '',
    castNoBar: false,
    horoscope: '',
    manglik: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [activePicker, setActivePicker] = useState<PickerField | null>(null)

  // Fetch lookup data on mount (only once)
  useEffect(() => {
    if (dataLoaded) return
    
    const loadData = async () => {
      setLookupLoading(true)
      try {
        await fetchLookup()
        setDataLoaded(true)
      } catch (error) {
        console.error('Error loading lookup data:', error)
      } finally {
        setLookupLoading(false)
      }
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run once on mount

  // Check screenName on mount and redirect if needed
  useEffect(() => {
    const checkScreenName = async () => {
      try {
        const userResponse = await api.get<GetUserResponse>('auth/getUser')
        if (userResponse.status === 'success' && userResponse.data?.screenName) {
          const screenName = userResponse.data.screenName.toLowerCase()
          const routeMap: Record<string, string> = {
            personaldetails: '/dashboard/personaldetails',
            careerdetails: '/dashboard/careerdetails',
            socialdetails: '/dashboard/socialdetails',
            srcmdetails: '/dashboard/srcmdetails',
            familydetails: '/dashboard/familydetails',
            partnerpreferences: '/dashboard/partnerpreferences',
            aboutyou: '/dashboard/aboutyou',
            underverification: '/under-verification',
            dashboard: '/dashboard',
          }
          
          // If screenName is not socialdetails, redirect to correct page
          if (screenName !== 'socialdetails' && routeMap[screenName]) {
            navigate(routeMap[screenName], { replace: true })
          }
        }
      } catch (error) {
        console.error('Error checking screenName:', error)
      }
    }
    checkScreenName()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      const payload: any = {
        maritalStatus: formData.maritalStatus
          ? formData.maritalStatus === 'Never married'
            ? 'nvm'
            : formData.maritalStatus.toLowerCase()
          : undefined,
        motherTongue: formData.motherTongue || undefined,
        religion: formData.religion ? formData.religion.toLowerCase().slice(0, 3) : undefined,
        cast: formData.castNoBar ? undefined : formData.cast || undefined,
        castNoBar: formData.castNoBar,
        horoscope: formData.horoscope || undefined,
        manglik: formData.manglik || undefined,
      }

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key]
      })

      const response = await api.patch<typeof payload, { status: string; code?: string; message?: string }>(
        'personalDetails',
        payload,
      )

      if (response.status === 'success' || response.code === 'CH200') {
        showToast('Social details updated successfully', 'success')
        await updateLastActiveScreen('srcmdetails')
        const userResponse = await api.get<GetUserResponse>('auth/getUser')
        if (userResponse.status === 'success' && userResponse.data?.screenName) {
          const screenName = userResponse.data.screenName.toLowerCase()
          const routeMap: Record<string, string> = {
            personaldetails: '/dashboard/personaldetails',
            careerdetails: '/dashboard/careerdetails',
            socialdetails: '/dashboard/socialdetails',
            srcmdetails: '/dashboard/srcmdetails',
            familydetails: '/dashboard/familydetails',
            partnerpreferences: '/dashboard/partnerpreferences',
            aboutyou: '/dashboard/aboutyou',
            dashboard: '/dashboard',
          }
          const route = routeMap[screenName] || '/dashboard/srcmdetails'
          navigate(route, { replace: true })
        } else {
          navigate('/dashboard/srcmdetails', { replace: true })
        }
      } else {
        showToast(response.message || 'Failed to update social details', 'error')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update social details'
      showToast(message.replace('API ', ''), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const getPickerOptions = (field: PickerField): string[] => {
    // Map current religion label to its lookup code (e.g. "Hindu" -> "hin")
    const currentReligionCode =
      lookupData.religion?.find((r) => r.label === formData.religion)?.value ??
      formData.religion.toLowerCase().slice(0, 3)

    switch (field) {
      case 'motherTongue':
        return lookupData.motherTongue?.map((m) => m.label) || ['Hindi', 'English', 'Tamil', 'Telugu']
      case 'caste':
        return (
          lookupData.casts
            ?.filter((c) => {
              const anyCast = c as unknown as { religion?: string }
              return !anyCast.religion || anyCast.religion === currentReligionCode
            })
            .map((c) => c.label) || ['Brahmin', 'Rajput', 'Kayastha']
        )
      case 'horoscope':
        return lookupData.horoscopes?.map((h) => h.label) || ['Aries', 'Leo', 'Pisces']
      case 'manglik':
        return lookupData.manglik?.map((m) => m.label) || ['Manglik', 'Non-Manglik', 'Angshik']
      default:
        return []
    }
  }

  const getPickerValue = (field: PickerField): string => {
    switch (field) {
      case 'motherTongue':
        return lookupData.motherTongue?.find((m) => m.value === formData.motherTongue)?.label || formData.motherTongue
      case 'caste':
        return lookupData.casts?.find((c) => c.value === formData.cast)?.label || formData.cast
      case 'horoscope':
        return lookupData.horoscopes?.find((h) => h.value === formData.horoscope)?.label || formData.horoscope
      case 'manglik':
        return lookupData.manglik?.find((m) => m.value === formData.manglik)?.label || formData.manglik
    }
  }

  const setPickerValue = (value: string) => {
    if (!activePicker) return

    switch (activePicker) {
      case 'motherTongue': {
        const selected = lookupData.motherTongue?.find((m) => m.label === value)
        setFormData((prev) => ({ ...prev, motherTongue: selected?.value || value }))
        break
      }
      case 'caste': {
        const normalizedValue = value.trim().toLowerCase()
        const selected = lookupData.casts?.find(
          (c) => c.label.trim().toLowerCase() === normalizedValue,
        )
        setFormData((prev) => ({ ...prev, cast: selected?.value || value }))
        break
      }
      case 'horoscope': {
        const selected = lookupData.horoscopes?.find((h) => h.label === value)
        setFormData((prev) => ({ ...prev, horoscope: selected?.value || value }))
        break
      }
      case 'manglik': {
        const selected = lookupData.manglik?.find((m) => m.label === value)
        setFormData((prev) => ({ ...prev, manglik: selected?.value || value }))
        break
      }
    }
    setActivePicker(null)
  }

  const maritalOptions =
    lookupData.maritalStatus?.map((m) => m.label) || [
      'Never married',
      'Divorced',
      'Widowed',
      'Annulled',
      'Pending divorce',
    ]

  const religionOptions =
    lookupData.religion?.map((r) => r.label) || ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Parsi', 'Others']

  const renderPickerModal = () => {
    if (!activePicker) return null
    const picker = activePicker
    return (
      <SelectModal
        isOpen
        title={`Select ${picker.charAt(0).toUpperCase() + picker.slice(1)}`}
        options={getPickerOptions(picker)}
        searchable
        selected={getPickerValue(picker)}
        onClose={() => setActivePicker(null)}
        onConfirm={setPickerValue}
      />
    )
  }

  if (profileLoading || lookupLoading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f8f2ff] to-white">
        <div className="rounded-3xl bg-white/90 px-8 py-12 text-center shadow-2xl">
          Loading your social details...
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#f8f2ff] via-white to-white py-10">
      <div className="mx-auto w-full max-w-2xl rounded-[32px] bg-white/95 p-8 shadow-[0_25px_70px_rgba(67,56,202,0.15)]">
        <div className="space-y-4 text-center">
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-[#ff4f8b] to-[#ffa0d2]" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">
              Step 3 of 7
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">Fill in your Social Details</h1>
            <p className="text-sm text-slate-500">
              Provide additional information like your marital status, religion, mother tongue and more.
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-inner">
            <ToggleGroup
              label="Marital Status"
              value={formData.maritalStatus}
              options={maritalOptions}
              onChange={(value) => setFormData((prev) => ({ ...prev, maritalStatus: value }))}
            />
            <SelectButton
              label="Mother Tongue"
              value={getPickerValue('motherTongue')}
              placeholder="Select mother tongue"
              onClick={() => setActivePicker('motherTongue')}
            />
            <ToggleGroup
              label="Religion"
              value={formData.religion}
              options={religionOptions}
              onChange={(value) => setFormData((prev) => ({ ...prev, religion: value }))}
            />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={formData.castNoBar}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, castNoBar: event.target.checked, cast: event.target.checked ? '' : prev.cast }))
                }
              />
              I am open to marry people of any caste
            </label>
            {!formData.castNoBar && (
              <SelectButton
                label="Caste"
                value={getPickerValue('caste')}
                placeholder="Select caste"
                onClick={() => setActivePicker('caste')}
              />
            )}
            <SelectButton
              label="Horoscope"
              value={getPickerValue('horoscope')}
              placeholder="Select horoscope"
              onClick={() => setActivePicker('horoscope')}
            />
            <SelectButton
              label="Manglik"
              value={getPickerValue('manglik')}
              placeholder="Select manglik"
              onClick={() => setActivePicker('manglik')}
            />
          </div>

          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              className="text-sm font-semibold text-slate-500 hover:text-slate-700"
              onClick={() => navigate('/dashboard/careerdetails', { replace: true })}
            >
              ← Back
            </button>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? 'Saving...' : 'Next'}
            </Button>
          </div>
        </form>
      </div>

      {renderPickerModal()}
    </section>
  )
}
