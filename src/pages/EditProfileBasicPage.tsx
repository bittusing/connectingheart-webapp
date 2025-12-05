import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { Button } from '../components/common/Button'
import { SelectModal } from '../components/forms/SelectModal'
import { TextInput } from '../components/forms/TextInput'
import { useApiClient } from '../hooks/useApiClient'
import { useLookup } from '../hooks/useLookup'
import { useCountryLookup } from '../hooks/useCountryLookup'
import { useMyProfileData } from '../hooks/useMyProfileData'
import { showToast } from '../utils/toast'

type UpdateResponse = {
  code?: string
  status: string
  message?: string
}

type PickerField = 'religion' | 'motherTongue' | 'country' | 'state' | 'city' | 'income' | 'cast' | 'height'

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
  const { profile: myProfileData, loading: profileLoading } = useMyProfileData()
  const { lookupData, fetchLookup, fetchStates, fetchCities } = useLookup()
  const { countries: countryOptions } = useCountryLookup()

  const [formData, setFormData] = useState({
    religion: '',
    religionValue: '',
    motherTongue: '',
    motherTongueValue: '',
    country: '',
    countryValue: '',
    state: '',
    stateValue: '',
    city: '',
    cityValue: '',
    income: '',
    incomeValue: '',
    cast: '',
    castValue: '',
    height: '',
    heightValue: '',
  })

  const [activePicker, setActivePicker] = useState<PickerField | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [states, setStates] = useState<Array<{ label: string; value: string }>>([])
  const [cities, setCities] = useState<Array<{ label: string; value: string }>>([])
  const [lookupLoading, setLookupLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Fetch lookup data on mount
  useEffect(() => {
    if (dataLoaded) return

    const loadData = async () => {
      setLookupLoading(true)
      try {
        await fetchLookup()
        setDataLoaded(true)
      } catch (error) {
        console.error('Error loading lookup data:', error)
        showToast('Failed to load lookup data', 'error')
      } finally {
        setLookupLoading(false)
      }
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load profile data into form
  useEffect(() => {
    if (!myProfileData || !lookupData) return

    const enriched = myProfileData.enriched || {}
    const religions = lookupData.religion || []
    const motherTongues = lookupData.motherTongue || lookupData.languages || []
    const casts = lookupData.casts || []
    const incomes = [
      { label: 'Rs. 0 - 1 Lakh', value: '1' },
      { label: 'Rs. 1 - 2 Lakh', value: '2' },
      { label: 'Rs. 2 - 3 Lakh', value: '3' },
      { label: 'Rs. 3 - 4 Lakh', value: '4' },
      { label: 'Rs. 4 - 5 Lakh', value: '5' },
      { label: 'Rs. 5 - 7 Lakh', value: '6' },
      { label: 'Rs. 7 - 10 Lakh', value: '7' },
      { label: 'Rs. 10 - 15 Lakh', value: '8' },
      { label: 'Rs. 15 - 20 Lakh', value: '9' },
      { label: 'Rs. 20 - 30 Lakh', value: '10' },
      { label: 'Rs. 30 - 50 Lakh', value: '11' },
      { label: 'Rs. 50+ Lakh', value: '12' },
    ]

    const religionOption = religions.find((r) => r.value === myProfileData.basic.religion)
    const motherTongueOption = motherTongues.find((m) => m.value === myProfileData.basic.motherTongue)
    const castOption = casts.find((c) => c.value === myProfileData.basic.cast)
    const incomeOption = incomes.find((i) => i.value === String(myProfileData.basic.income))

    setFormData({
      religion: religionOption?.label || enriched.religionLabel || '',
      religionValue: myProfileData.basic.religion || '',
      motherTongue: motherTongueOption?.label || enriched.motherTongueLabel || '',
      motherTongueValue: myProfileData.basic.motherTongue || '',
      country: enriched.countryLabel || '',
      countryValue: myProfileData.miscellaneous.country || '',
      state: enriched.stateLabel || '',
      stateValue: myProfileData.miscellaneous.state || '',
      city: enriched.cityLabel || '',
      cityValue: myProfileData.miscellaneous.city || '',
      income: incomeOption?.label || '',
      incomeValue: String(myProfileData.basic.income) || '',
      cast: castOption?.label || enriched.castLabel || '',
      castValue: myProfileData.basic.cast || '',
      height: myProfileData.basic.height ? formatHeight(myProfileData.basic.height) : '',
      heightValue: myProfileData.basic.height ? String(myProfileData.basic.height) : '',
    })

    // Load states and cities if country/state are available
    if (myProfileData.miscellaneous.country) {
      fetchStates(myProfileData.miscellaneous.country)
        .then((stateList) => {
          setStates(stateList)
          if (myProfileData.miscellaneous.state) {
            return fetchCities(myProfileData.miscellaneous.state)
          }
          return []
        })
        .then((cityList) => {
          if (cityList) setCities(cityList)
        })
        .catch((error) => {
          console.error('Error loading states/cities:', error)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myProfileData, lookupData])

  // Fetch states when country changes
  useEffect(() => {
    if (!formData.countryValue) {
      setStates([])
      setCities([])
      return
    }

    const loadStates = async () => {
      try {
        const stateList = await fetchStates(formData.countryValue)
        setStates(stateList)
        setFormData((prev) => ({ ...prev, state: '', stateValue: '', city: '', cityValue: '' }))
        setCities([])
      } catch (error) {
        console.error('Error loading states:', error)
      }
    }
    loadStates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.countryValue])

  // Fetch cities when state changes
  useEffect(() => {
    if (!formData.stateValue) {
      setCities([])
      return
    }

    const loadCities = async () => {
      try {
        const cityList = await fetchCities(formData.stateValue)
        setCities(cityList)
        setFormData((prev) => ({ ...prev, city: '', cityValue: '' }))
      } catch (error) {
        console.error('Error loading cities:', error)
      }
    }
    loadCities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.stateValue])

  const getPickerOptions = (field: PickerField): string[] => {
    if (!lookupData) return []

    switch (field) {
      case 'religion':
        return (lookupData.religion || []).map((r) => r.label)
      case 'motherTongue':
        return (lookupData.motherTongue || lookupData.languages || []).map((m) => m.label)
      case 'country':
        return countryOptions.map((c) => c.label)
      case 'state':
        return states.map((s) => s.label)
      case 'city':
        return cities.map((c) => c.label)
      case 'income':
        return [
          'Rs. 0 - 1 Lakh',
          'Rs. 1 - 2 Lakh',
          'Rs. 2 - 3 Lakh',
          'Rs. 3 - 4 Lakh',
          'Rs. 4 - 5 Lakh',
          'Rs. 5 - 7 Lakh',
          'Rs. 7 - 10 Lakh',
          'Rs. 10 - 15 Lakh',
          'Rs. 15 - 20 Lakh',
          'Rs. 20 - 30 Lakh',
          'Rs. 30 - 50 Lakh',
          'Rs. 50+ Lakh',
        ]
      case 'cast':
        return (lookupData.casts || []).map((c) => c.label)
      case 'height':
        // Generate height options from 4'0" to 7'0"
        const heights: string[] = []
        for (let feet = 4; feet <= 7; feet++) {
          for (let inches = 0; inches < 12; inches++) {
            const heightInInches = feet * 12 + inches
            heights.push(formatHeight(heightInInches))
          }
        }
        return heights
      default:
        return []
    }
  }

  const handlePickerConfirm = (field: PickerField, label: string) => {
    if (!lookupData) return

    switch (field) {
      case 'religion': {
        const option = (lookupData.religion || []).find((r) => r.label === label)
        setFormData((prev) => ({
          ...prev,
          religion: label,
          religionValue: option?.value || '',
        }))
        break
      }
      case 'motherTongue': {
        const option = (lookupData.motherTongue || lookupData.languages || []).find((m) => m.label === label)
        setFormData((prev) => ({
          ...prev,
          motherTongue: label,
          motherTongueValue: option?.value || '',
        }))
        break
      }
      case 'country': {
        const option = countryOptions.find((c) => c.label === label)
        setFormData((prev) => ({
          ...prev,
          country: label,
          countryValue: option?.value || '',
        }))
        break
      }
      case 'state': {
        const option = states.find((s) => s.label === label)
        setFormData((prev) => ({
          ...prev,
          state: label,
          stateValue: option?.value || '',
        }))
        break
      }
      case 'city': {
        const option = cities.find((c) => c.label === label)
        setFormData((prev) => ({
          ...prev,
          city: label,
          cityValue: option?.value || '',
        }))
        break
      }
      case 'income': {
        const incomeMap: Record<string, string> = {
          'Rs. 0 - 1 Lakh': '1',
          'Rs. 1 - 2 Lakh': '2',
          'Rs. 2 - 3 Lakh': '3',
          'Rs. 3 - 4 Lakh': '4',
          'Rs. 4 - 5 Lakh': '5',
          'Rs. 5 - 7 Lakh': '6',
          'Rs. 7 - 10 Lakh': '7',
          'Rs. 10 - 15 Lakh': '8',
          'Rs. 15 - 20 Lakh': '9',
          'Rs. 20 - 30 Lakh': '10',
          'Rs. 30 - 50 Lakh': '11',
          'Rs. 50+ Lakh': '12',
        }
        setFormData((prev) => ({
          ...prev,
          income: label,
          incomeValue: incomeMap[label] || '',
        }))
        break
      }
      case 'cast': {
        const option = (lookupData.casts || []).find((c) => c.label === label)
        setFormData((prev) => ({
          ...prev,
          cast: label,
          castValue: option?.value || '',
        }))
        break
      }
      case 'height': {
        const heightInInches = parseHeight(label)
        setFormData((prev) => ({
          ...prev,
          height: label,
          heightValue: String(heightInInches),
        }))
        break
      }
    }
    setActivePicker(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload: any = {
        religion: formData.religionValue || undefined,
        motherTongue: formData.motherTongueValue || undefined,
        income: formData.incomeValue ? parseInt(formData.incomeValue, 10) : undefined,
        cast: formData.castValue || undefined,
        height: formData.heightValue ? parseInt(formData.heightValue, 10) : undefined,
        country: formData.countryValue || undefined,
        state: formData.stateValue || undefined,
        city: formData.cityValue || undefined,
      }

      // Remove undefined fields
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key]
      })

      const response = await api.patch<typeof payload, UpdateResponse>('personalDetails', payload)

      if (response.status === 'success' || response.code === 'CH200') {
        showToast(response.message || 'Profile updated successfully', 'success')
        navigate('/dashboard/myprofile')
      } else {
        throw new Error(response.message || 'Failed to update profile')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message.replace('API ', '') || 'Failed to update profile' : 'Failed to update profile'
      showToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (profileLoading || lookupLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent"></div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f2ff] via-white to-white">
      {/* Pink Header */}
      <div className="bg-pink-500 px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white hover:text-pink-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold text-white">Connecting Hearts</h1>
          <button
            onClick={() => navigate('/dashboard/myprofile')}
            className="rounded-lg bg-pink-400 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-pink-300"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10">

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-slate-50 p-6 dark:bg-slate-800/50">
          {/* Religion */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Religion</label>
            <TextInput
              value={formData.religion}
              placeholder="Select Religion"
              readOnly
              onClick={() => setActivePicker('religion')}
              className="cursor-pointer"
            />
          </div>

          {/* Mother Tongue */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Mother Tongue</label>
            <TextInput
              value={formData.motherTongue}
              placeholder="Select Mother Tongue"
              readOnly
              onClick={() => setActivePicker('motherTongue')}
              className="cursor-pointer"
            />
          </div>

          {/* Country */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Country</label>
            <TextInput
              value={formData.country}
              placeholder="Select Country"
              readOnly
              onClick={() => setActivePicker('country')}
              className="cursor-pointer"
            />
          </div>

          {/* State */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">State</label>
            <TextInput
              value={formData.state}
              placeholder={formData.countryValue ? 'Select State' : 'Select Country first'}
              readOnly
              onClick={() => formData.countryValue && setActivePicker('state')}
              className={formData.countryValue ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
              disabled={!formData.countryValue}
            />
          </div>

          {/* City */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
            <TextInput
              value={formData.city}
              placeholder={formData.stateValue ? 'Select City' : 'Select State first'}
              readOnly
              onClick={() => formData.stateValue && setActivePicker('city')}
              className={formData.stateValue ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
              disabled={!formData.stateValue}
            />
          </div>

          {/* Income */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Income</label>
            <TextInput
              value={formData.income}
              placeholder="Select Income"
              readOnly
              onClick={() => setActivePicker('income')}
              className="cursor-pointer"
            />
          </div>

          {/* Caste */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Caste</label>
            <TextInput
              value={formData.cast}
              placeholder="Select Caste"
              readOnly
              onClick={() => setActivePicker('cast')}
              className="cursor-pointer"
            />
          </div>

          {/* Height */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Height</label>
            <TextInput
              value={formData.height}
              placeholder="Select Height"
              readOnly
              onClick={() => setActivePicker('height')}
              className="cursor-pointer"
            />
          </div>

          {/* Update Button */}
          <div className="pt-4">
            <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </div>

      {/* Select Modals */}
      {activePicker && (
        <SelectModal
          title={`Select ${activePicker.charAt(0).toUpperCase() + activePicker.slice(1)}`}
          options={getPickerOptions(activePicker)}
          isOpen={true}
          selected={formData[activePicker]}
          onClose={() => setActivePicker(null)}
          onConfirm={(value) => handlePickerConfirm(activePicker, value)}
        />
      )}
    </div>
  )
}

