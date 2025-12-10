import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { SelectButton } from '../components/forms/FormComponents'
import { SelectModal } from '../components/forms/SelectModal'
import { TextInput } from '../components/forms/TextInput'
import { useMyProfileData } from '../hooks/useMyProfileData'
import { useLookup } from '../hooks/useLookup'
import { useCountryLookup } from '../hooks/useCountryLookup'
import { useApiClient } from '../hooks/useApiClient'
import { showToast } from '../utils/toast'
import type { LookupOption } from '../types/api'

type PickerField = 'rashi' | 'nakshatra' | 'manglik' | 'horoscope' | 'countryOfBirth' | 'stateOfBirth' | 'cityOfBirth'

export const EditHoroscopePage = () => {
  const navigate = useNavigate()
  const api = useApiClient()
  const { profile, loading, error } = useMyProfileData()
  const { lookupData, fetchLookup, fetchStates, fetchCities } = useLookup()
  const { countries: countryOptions } = useCountryLookup()

  const [formData, setFormData] = useState({
    rashi: '',
    nakshatra: '',
    manglik: '',
    horoscope: '',
    countryOfBirth: '',
    stateOfBirth: '',
    cityOfBirth: '',
    timeOfBirth: '',
  })

  const [states, setStates] = useState<LookupOption[]>([])
  const [cities, setCities] = useState<LookupOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [activePicker, setActivePicker] = useState<PickerField | null>(null)

  // Store label mappings for display
  const [displayLabels, setDisplayLabels] = useState<Record<string, string>>({})

  // Fetch lookup data on mount
  useEffect(() => {
    if (dataLoaded) return

    const loadData = async () => {
      try {
        await fetchLookup()
        setDataLoaded(true)
      } catch (error) {
        console.error('Error loading lookup data:', error)
      }
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load profile data into form
  useEffect(() => {
    if (profile && dataLoaded) {
      const rashiOptions = lookupData.rashi || lookupData.horoscopes || []
      const nakshatraOptions = lookupData.nakshatra || []
      const manglikOptions = lookupData.manglik || []
      const horoscopeOptions = lookupData.horoscopes || lookupData.rashi || []

      // Find labels for current values
      const rashiLabel = rashiOptions.find((r) => r.value === profile.horoscope.rashi)?.label || ''
      const nakshatraLabel = nakshatraOptions.find((n) => n.value === profile.horoscope.nakshatra)?.label || ''
      const manglikLabel = manglikOptions.find((m) => m.value === profile.horoscope.manglik)?.label || ''
      const horoscopeLabel = horoscopeOptions.find((h) => h.value === profile.horoscope.horoscope)?.label || ''

      // Get country/state/city labels
      const countryOfBirthLabel = countryOptions.find((c) => c.value === (profile.horoscope as any).countryOfBirth)?.label || ''
      let stateOfBirthLabel = ''
      let cityOfBirthLabel = ''

      setDisplayLabels({
        rashi: rashiLabel,
        nakshatra: nakshatraLabel,
        manglik: manglikLabel,
        horoscope: horoscopeLabel,
        countryOfBirth: countryOfBirthLabel,
        stateOfBirth: stateOfBirthLabel,
        cityOfBirth: cityOfBirthLabel,
      })

      const countryOfBirth = (profile.horoscope as any).countryOfBirth || ''
      const stateOfBirth = (profile.horoscope as any).stateOfBirth || ''
      const cityOfBirth = (profile.horoscope as any).cityOfBirth || ''

      setFormData({
        rashi: profile.horoscope.rashi || '',
        nakshatra: profile.horoscope.nakshatra || '',
        manglik: profile.horoscope.manglik || '',
        horoscope: profile.horoscope.horoscope || '',
        countryOfBirth,
        stateOfBirth,
        cityOfBirth,
        timeOfBirth: profile.horoscope.timeOfBirth || '',
      })

      // Load states and cities if country/state are available
      if (countryOfBirth) {
        fetchStates(countryOfBirth)
          .then((stateList) => {
            setStates(stateList)
            const stateLabel = stateList.find((s) => s.value === stateOfBirth)?.label || ''
            setDisplayLabels((prev) => ({ ...prev, stateOfBirth: stateLabel }))
            if (stateOfBirth) {
              return fetchCities(stateOfBirth)
            }
            return Promise.resolve([])
          })
          .then((cityList) => {
            setCities(cityList)
            const cityLabel = cityList.find((c) => c.value === cityOfBirth)?.label || ''
            setDisplayLabels((prev) => ({ ...prev, cityOfBirth: cityLabel }))
          })
          .catch((error) => {
            console.error('Error loading states/cities:', error)
          })
      }
    }
  }, [profile, dataLoaded, lookupData, countryOptions, fetchStates, fetchCities])

  // Fetch states when country changes
  useEffect(() => {
    if (!formData.countryOfBirth) {
      setStates([])
      setCities([])
      setFormData((prev) => ({ ...prev, stateOfBirth: '', cityOfBirth: '' }))
      setDisplayLabels((prev) => ({ ...prev, stateOfBirth: '', cityOfBirth: '' }))
      return
    }

    const loadStates = async () => {
      try {
        const stateList = await fetchStates(formData.countryOfBirth)
        setStates(stateList)
        setFormData((prev) => ({ ...prev, stateOfBirth: '', cityOfBirth: '' }))
        setDisplayLabels((prev) => ({ ...prev, stateOfBirth: '', cityOfBirth: '' }))
        setCities([])
      } catch (error) {
        console.error('Error loading states:', error)
      }
    }
    loadStates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.countryOfBirth])

  // Fetch cities when state changes
  useEffect(() => {
    if (!formData.stateOfBirth) {
      setCities([])
      setFormData((prev) => ({ ...prev, cityOfBirth: '' }))
      setDisplayLabels((prev) => ({ ...prev, cityOfBirth: '' }))
      return
    }

    const loadCities = async () => {
      try {
        const cityList = await fetchCities(formData.stateOfBirth)
        setCities(cityList)
        setFormData((prev) => ({ ...prev, cityOfBirth: '' }))
        setDisplayLabels((prev) => ({ ...prev, cityOfBirth: '' }))
      } catch (error) {
        console.error('Error loading cities:', error)
      }
    }
    loadCities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.stateOfBirth])

  // Get lookup options from API response
  const rashiOptions = lookupData.rashi || lookupData.horoscopes || []
  const nakshatraOptions = lookupData.nakshatra || []
  const manglikOptions = lookupData.manglik || []
  const horoscopeOptions = lookupData.horoscopes || lookupData.rashi || []

  // Get options for active picker
  const getPickerOptions = (): string[] => {
    if (!activePicker) return []

    switch (activePicker) {
      case 'rashi':
        return rashiOptions.map((opt) => opt.label)
      case 'nakshatra':
        return nakshatraOptions.map((opt) => opt.label)
      case 'manglik':
        return manglikOptions.map((opt) => opt.label)
      case 'horoscope':
        return horoscopeOptions.map((opt) => opt.label)
      case 'countryOfBirth':
        return countryOptions.map((opt) => opt.label)
      case 'stateOfBirth':
        return states.map((opt) => opt.label)
      case 'cityOfBirth':
        return cities.map((opt) => opt.label)
      default:
        return []
    }
  }

  // Get current selected label for active picker
  const getSelectedLabel = (): string => {
    if (!activePicker) return ''
    return displayLabels[activePicker] || ''
  }

  // Handle picker confirmation
  const handlePickerConfirm = (label: string) => {
    if (!activePicker) return

    let selectedValue = ''
    let selectedLabel = label

    switch (activePicker) {
      case 'rashi': {
        const selected = rashiOptions.find((r) => r.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'nakshatra': {
        const selected = nakshatraOptions.find((n) => n.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'manglik': {
        const selected = manglikOptions.find((m) => m.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'horoscope': {
        const selected = horoscopeOptions.find((h) => h.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'countryOfBirth': {
        const selected = countryOptions.find((c) => c.label === label)
        selectedValue = selected?.value || ''
        // Reset state and city when country changes
        setFormData((prev) => ({
          ...prev,
          countryOfBirth: selectedValue,
          stateOfBirth: '',
          cityOfBirth: '',
        }))
        setDisplayLabels((prev) => ({
          ...prev,
          countryOfBirth: selectedLabel,
          stateOfBirth: '',
          cityOfBirth: '',
        }))
        setActivePicker(null)
        return
      }
      case 'stateOfBirth': {
        const selected = states.find((s) => s.label === label)
        selectedValue = selected?.value || ''
        // Reset city when state changes
        setFormData((prev) => ({
          ...prev,
          stateOfBirth: selectedValue,
          cityOfBirth: '',
        }))
        setDisplayLabels((prev) => ({
          ...prev,
          stateOfBirth: selectedLabel,
          cityOfBirth: '',
        }))
        setActivePicker(null)
        return
      }
      case 'cityOfBirth': {
        const selected = cities.find((c) => c.label === label)
        selectedValue = selected?.value || ''
        break
      }
    }

    setFormData((prev) => ({
      ...prev,
      [activePicker]: selectedValue,
    }))

    setDisplayLabels((prev) => ({
      ...prev,
      [activePicker]: selectedLabel,
    }))

    setActivePicker(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Prepare payload matching the API structure
      const updatePayload: any = {
        rashi: formData.rashi || undefined,
        nakshatra: formData.nakshatra || undefined,
        manglik: formData.manglik || undefined,
        horoscope: formData.horoscope || undefined,
        countryOfBirth: formData.countryOfBirth || undefined,
        stateOfBirth: formData.stateOfBirth || undefined,
        cityOfBirth: formData.cityOfBirth || undefined,
        timeOfBirth: formData.timeOfBirth || undefined,
        section: 'horoscope',
      }

      // Remove empty string fields (convert to undefined then remove)
      Object.keys(updatePayload).forEach((key) => {
        if (updatePayload[key] === '' || updatePayload[key] === undefined) {
          delete updatePayload[key]
        }
      })

      // Always include section
      updatePayload.section = 'horoscope'

      const response = await api.patch<typeof updatePayload, { code: string; status: string; message: string }>(
        'personalDetails/editProfile',
        updatePayload,
      )

      if (response.status === 'success' || response.code === 'CH200') {
        showToast('Profile updated successfully!', 'success')
        navigate('/dashboard/myprofile')
      } else {
        throw new Error(response.message || 'Failed to update profile')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message.replace('API ', '') || 'Failed to update profile.' : 'Failed to update profile.'
      showToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !dataLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent"></div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          {error || 'Failed to load profile. Please try refreshing the page.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Edit Profile</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Update your horoscope information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-4">
            <SelectButton
              label="Rashi"
              value={displayLabels.rashi}
              placeholder="Select Rashi"
              onClick={() => setActivePicker('rashi')}
            />

            <SelectButton
              label="Nakshatra"
              value={displayLabels.nakshatra}
              placeholder="Select Nakshatra"
              onClick={() => setActivePicker('nakshatra')}
            />

            <SelectButton
              label="Country Of Birth"
              value={displayLabels.countryOfBirth}
              placeholder="Select Country Of Birth"
              onClick={() => setActivePicker('countryOfBirth')}
            />

            <SelectButton
              label="State Of Birth"
              value={displayLabels.stateOfBirth}
              placeholder="Select State Of Birth"
              onClick={() => setActivePicker('stateOfBirth')}
              disabled={!formData.countryOfBirth}
            />

            <SelectButton
              label="City Of Birth"
              value={displayLabels.cityOfBirth}
              placeholder="Select City Of Birth"
              onClick={() => setActivePicker('cityOfBirth')}
              disabled={!formData.stateOfBirth}
            />

            <TextInput
              label="Time Of Birth"
              type="text"
              value={formData.timeOfBirth}
              onChange={(e) => setFormData((prev) => ({ ...prev, timeOfBirth: e.target.value }))}
              placeholder="Enter Time Of Birth (e.g., 05-07-1995)"
            />

            <SelectButton
              label="Horoscope"
              value={displayLabels.horoscope}
              placeholder="Select Horoscope"
              onClick={() => setActivePicker('horoscope')}
            />

            <SelectButton
              label="Manglik"
              value={displayLabels.manglik}
              placeholder="Select Manglik"
              onClick={() => setActivePicker('manglik')}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <Button type="submit" size="lg" disabled={submitting} className="w-full max-w-md">
            {submitting ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </form>

      <SelectModal
        title={
          activePicker
            ? activePicker === 'countryOfBirth'
              ? 'Select Country Of Birth'
              : activePicker === 'stateOfBirth'
                ? 'Select State Of Birth'
                : activePicker === 'cityOfBirth'
                  ? 'Select City Of Birth'
                  : `Select ${activePicker.charAt(0).toUpperCase() + activePicker.slice(1)}`
            : ''
        }
        options={getPickerOptions()}
        isOpen={activePicker !== null}
        selected={getSelectedLabel()}
        onClose={() => setActivePicker(null)}
        onConfirm={handlePickerConfirm}
      />
    </div>
  )
}

