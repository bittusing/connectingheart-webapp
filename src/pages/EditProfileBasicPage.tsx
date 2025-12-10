import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { SelectButton } from '../components/forms/FormComponents'
import { SelectModal } from '../components/forms/SelectModal'
import { useMyProfileData } from '../hooks/useMyProfileData'
import { useLookup } from '../hooks/useLookup'
import { useCountryLookup } from '../hooks/useCountryLookup'
import { useApiClient } from '../hooks/useApiClient'
import { showToast } from '../utils/toast'
import type { LookupOption } from '../types/api'

const SelectInput = ({
  label,
  value,
  placeholder,
  options,
  onChange,
  disabled,
}: {
  label: string
  value: string
  placeholder: string
  options: LookupOption[]
  onChange: (value: string) => void
  disabled?: boolean
}) => (
  <label className="space-y-1">
    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
)

type PickerField = 'religion' | 'motherTongue' | 'income' | 'caste' | 'height'

const formatHeight = (heightInInches: number): string => {
  const feet = Math.floor(heightInInches / 12)
  const inches = heightInInches % 12
  const meters = (heightInInches * 0.0254).toFixed(2)
  return `${feet}'${inches}"(${meters} mts)`
}

const parseHeight = (heightString: string): number => {
  // Parse "5'5"(1.65 mts)" format to inches
  const match = heightString.match(/(\d+)'(\d+)"/)
  if (match) {
    const feet = parseInt(match[1], 10)
    const inches = parseInt(match[2], 10)
    return feet * 12 + inches
  }
  return 0
}

export const EditProfileBasicPage = () => {
  const navigate = useNavigate()
  const api = useApiClient()
  const { profile, loading, error } = useMyProfileData()
  const { lookupData, fetchLookup, fetchStates, fetchCities } = useLookup()
  const { countries: countryOptions } = useCountryLookup()

  const [formData, setFormData] = useState({
    religion: '',
    residentialStatus: '',
    motherTongue: '',
    country: '',
    state: '',
    city: '',
    income: '',
    caste: '',
    height: '',
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
      const enriched = profile.enriched || {}
      
      // Set display labels from enriched data
      setDisplayLabels({
        religion: enriched.religionLabel || '',
        motherTongue: enriched.motherTongueLabel || '',
        income: profile.basic.income ? (lookupData.income?.find(i => i.value === profile.basic.income)?.label || '') : '',
        caste: enriched.castLabel || '',
        height: profile.basic.height ? formatHeight(profile.basic.height) : '',
      })
      
      // Find labels for current values
      const religionLabel = religions.find((r) => r.value === profile.basic.religion)?.label || ''
      const motherTongueLabel = motherTongueOptions.find((m) => m.value === profile.basic.motherTongue)?.label || ''
      const incomeLabel = incomeOptions.find((i) => i.value === profile.basic.income)?.label || ''
      const casteLabel = casts.find((c) => c.value === profile.basic.cast)?.label || ''
      const heightLabel = heightOptions.find((h) => h.value === profile.basic.height)?.label || ''

      setDisplayLabels({
        religion: religionLabel,
        motherTongue: motherTongueLabel,
        income: incomeLabel,
        caste: casteLabel,
        height: heightLabel,
      })

      setFormData({
        religion: profile.basic.religion || '',
        residentialStatus: profile.miscellaneous.residentialStatus || '',
        motherTongue: profile.basic.motherTongue || '',
        country: profile.miscellaneous.country || '',
        state: profile.miscellaneous.state || '',
        city: profile.miscellaneous.city || '',
        income: profile.basic.income ? String(profile.basic.income) : '',
        caste: profile.basic.cast || '',
        height: profile.basic.height ? String(profile.basic.height) : '',
      })

      // Load states and cities if country/state are available
      if (profile.miscellaneous.country) {
        fetchStates(profile.miscellaneous.country)
          .then((stateList) => {
            setStates(stateList)
            if (profile.miscellaneous.state) {
              return fetchCities(profile.miscellaneous.state)
            }
            return Promise.resolve([])
          })
          .then((cityList) => {
            setCities(cityList)
          })
          .catch((error) => {
            console.error('Error loading states/cities:', error)
          })
      }
    }
  }, [profile, dataLoaded, fetchStates, fetchCities])

  // Fetch states when country changes
  useEffect(() => {
    if (!formData.country) {
      setStates([])
      setCities([])
      setFormData((prev) => ({ ...prev, state: '', city: '' }))
      return
    }

    const loadStates = async () => {
      try {
        const stateList = await fetchStates(formData.country)
        setStates(stateList)
        setFormData((prev) => ({ ...prev, state: '', city: '' }))
        setCities([])
      } catch (error) {
        console.error('Error loading states:', error)
      }
    }
    loadStates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.country])

  // Fetch cities when state changes
  useEffect(() => {
    if (!formData.state) {
      setCities([])
      setFormData((prev) => ({ ...prev, city: '' }))
      return
    }

    const loadCities = async () => {
      try {
        const cityList = await fetchCities(formData.state)
        setCities(cityList)
        setFormData((prev) => ({ ...prev, city: '' }))
      } catch (error) {
        console.error('Error loading cities:', error)
      }
    }
    loadCities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.state])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Convert height and income to numbers
      const heightValue = formData.height ? Number(formData.height) : undefined
      const incomeValue = formData.income ? Number(formData.income) : undefined

      // Prepare payload matching the API structure (flat structure with section)
      const updatePayload: any = {
        religion: formData.religion || undefined,
        residentialStatus: formData.residentialStatus || undefined,
        motherTongue: formData.motherTongue || undefined,
        country: formData.country || undefined,
        state: formData.state || undefined,
        city: formData.city || undefined,
        income: incomeValue,
        cast: formData.caste || undefined,
        height: heightValue,
        section: 'basic',
      }

      // Remove undefined fields
      Object.keys(updatePayload).forEach((key) => {
        if (updatePayload[key] === undefined) delete updatePayload[key]
      })

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

  // Get lookup options from API response
  const religions = lookupData.religion || []
  const residentialStatusOptions = lookupData.residentialStatus || []
  const motherTongueOptions = lookupData.motherTongue || lookupData.languages || []
  const casts = lookupData.casts || []
  const incomeOptions = lookupData.income || []
  const heightOptions = lookupData.height || []

  // Get options for active picker
  const getPickerOptions = (): string[] => {
    if (!activePicker) return []
    
    switch (activePicker) {
      case 'religion':
        return religions.map((opt) => opt.label)
      case 'residentialStatus':
        return residentialStatusOptions.map((opt) => opt.label)
      case 'motherTongue':
        return motherTongueOptions.map((opt) => opt.label)
      case 'income':
        return incomeOptions.map((opt) => opt.label)
      case 'caste':
        return casts.map((opt) => opt.label)
      case 'height':
        return heightOptions.map((opt) => opt.label)
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

    let selectedValue: string | number = ''
    let selectedLabel = label

    switch (activePicker) {
      case 'religion': {
        const selected = religions.find((r) => r.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'residentialStatus': {
        const selected = residentialStatusOptions.find((r) => r.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'motherTongue': {
        const selected = motherTongueOptions.find((m) => m.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'income': {
        const selected = incomeOptions.find((i) => i.label === label)
        selectedValue = selected?.value !== undefined ? String(selected.value) : ''
        break
      }
      case 'caste': {
        const selected = casts.find((c) => c.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'height': {
        const selected = heightOptions.find((h) => h.label === label)
        selectedValue = selected?.value !== undefined ? String(selected.value) : ''
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

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Edit Profile</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Update your basic profile information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-4">
            <SelectButton
              label="Religion"
              value={displayLabels.religion}
              placeholder="Select Religion"
              onClick={() => setActivePicker('religion')}
            />

            <SelectButton
              label="Residential Status"
              value={displayLabels.residentialStatus}
              placeholder="Select Residential Status"
              onClick={() => setActivePicker('residentialStatus')}
            />

            <SelectButton
              label="Mother Tongue"
              value={displayLabels.motherTongue}
              placeholder="Select Mother Tongue"
              onClick={() => setActivePicker('motherTongue')}
            />

            <SelectInput
              label="Country"
              value={formData.country}
              placeholder="Select Country"
              options={countryOptions}
              onChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
            />

            <SelectInput
              label="State"
              value={formData.state}
              placeholder="Select State"
              options={states}
              onChange={(value) => setFormData((prev) => ({ ...prev, state: value }))}
              disabled={!formData.country}
            />

            <SelectInput
              label="City"
              value={formData.city}
              placeholder="Select City"
              options={cities}
              onChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}
              disabled={!formData.state}
            />

            <SelectButton
              label="Income"
              value={displayLabels.income}
              placeholder="Select Income"
              onClick={() => setActivePicker('income')}
            />

            <SelectButton
              label="Caste"
              value={displayLabels.caste}
              placeholder="Select Caste"
              onClick={() => setActivePicker('caste')}
            />

            <SelectButton
              label="Height"
              value={displayLabels.height}
              placeholder="Select Height"
              onClick={() => setActivePicker('height')}
            />
          </div>
        </div>

        <SelectModal
          title={activePicker ? `Select ${activePicker.charAt(0).toUpperCase() + activePicker.slice(1).replace(/([A-Z])/g, ' $1')}` : ''}
          options={getPickerOptions()}
          isOpen={activePicker !== null}
          selected={getSelectedLabel()}
          onClose={() => setActivePicker(null)}
          onConfirm={handlePickerConfirm}
        />

        <div className="flex justify-center">
          <Button type="submit" size="lg" disabled={submitting} className="w-full max-w-md">
            {submitting ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </form>
    </div>
  )
}

