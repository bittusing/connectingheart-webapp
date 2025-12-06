import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { SelectButton } from '../components/forms/FormComponents'
import { SelectModal } from '../components/forms/SelectModal'
import { TextInput } from '../components/forms/TextInput'
import { useMyProfileData } from '../hooks/useMyProfileData'
import { useLookup } from '../hooks/useLookup'
import { useApiClient } from '../hooks/useApiClient'
import { showToast } from '../utils/toast'

type PickerField = 'employed_in' | 'occupation' | 'interestedInSettlingAbroad'

export const EditCareerPage = () => {
  const navigate = useNavigate()
  const api = useApiClient()
  const { profile, loading, error } = useMyProfileData()
  const { lookupData, fetchLookup } = useLookup()

  const [formData, setFormData] = useState({
    aboutMyCareer: '',
    employed_in: '',
    occupation: '',
    organisationName: '',
    interestedInSettlingAbroad: '',
  })

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
      const employedInOptions = lookupData.employed_in || []
      const occupationOptions = lookupData.occupation || []

      // Find labels for current values
      const employedInLabel = employedInOptions.find((e) => e.value === profile.career.employed_in)?.label || ''
      const occupationLabel = occupationOptions.find((o) => o.value === profile.career.occupation)?.label || ''
      const interestedInSettlingAbroadLabel =
        profile.career.interestedInSettlingAbroad === 'Y' ? 'Yes' : profile.career.interestedInSettlingAbroad === 'N' ? 'No' : ''

      setDisplayLabels({
        employed_in: employedInLabel,
        occupation: occupationLabel,
        interestedInSettlingAbroad: interestedInSettlingAbroadLabel,
      })

      setFormData({
        aboutMyCareer: profile.career.aboutMyCareer || profile.career.aboutCareer || '',
        employed_in: profile.career.employed_in || '',
        occupation: profile.career.occupation || '',
        organisationName: profile.career.organisationName || '',
        interestedInSettlingAbroad: profile.career.interestedInSettlingAbroad || '',
      })
    }
  }, [profile, dataLoaded, lookupData])

  // Get lookup options from API response
  const employedInOptions = lookupData.employed_in || []
  const occupationOptions = lookupData.occupation || []
  const interestedInSettlingAbroadOptions = [
    { label: 'Yes', value: 'Y' },
    { label: 'No', value: 'N' },
  ]

  // Get options for active picker
  const getPickerOptions = (): string[] => {
    if (!activePicker) return []

    switch (activePicker) {
      case 'employed_in':
        return employedInOptions.map((opt) => opt.label)
      case 'occupation':
        return occupationOptions.map((opt) => opt.label)
      case 'interestedInSettlingAbroad':
        return interestedInSettlingAbroadOptions.map((opt) => opt.label)
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
      case 'employed_in': {
        const selected = employedInOptions.find((e) => e.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'occupation': {
        const selected = occupationOptions.find((o) => o.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'interestedInSettlingAbroad': {
        const selected = interestedInSettlingAbroadOptions.find((i) => i.label === label)
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
        aboutMyCareer: formData.aboutMyCareer || undefined,
        employed_in: formData.employed_in || undefined,
        occupation: formData.occupation || undefined,
        organisationName: formData.organisationName || undefined,
        interestedInSettlingAbroad: formData.interestedInSettlingAbroad || undefined,
        section: 'career',
      }

      // Remove empty string fields (convert to undefined then remove)
      Object.keys(updatePayload).forEach((key) => {
        if (updatePayload[key] === '' || updatePayload[key] === undefined) {
          delete updatePayload[key]
        }
      })

      // Always include section
      updatePayload.section = 'career'

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

  const characterCount = formData.aboutMyCareer.length
  const maxCharacters = 125
  const isOverLimit = characterCount > maxCharacters

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Edit Profile</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Update your career information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-4">
            {/* About My Career */}
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">About My Career</span>
              <textarea
                value={formData.aboutMyCareer}
                onChange={(e) => setFormData((prev) => ({ ...prev, aboutMyCareer: e.target.value }))}
                rows={6}
                maxLength={maxCharacters}
                className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white ${
                  isOverLimit ? 'border-red-300 focus:border-red-500' : ''
                }`}
                placeholder="Tell us about your career..."
              />
              <div className="flex justify-end">
                <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-slate-500'}`}>
                  {characterCount} / {maxCharacters}
                </span>
              </div>
            </label>

            <SelectButton
              label="Employed In"
              value={displayLabels.employed_in}
              placeholder="Select Employed In"
              onClick={() => setActivePicker('employed_in')}
            />

            <SelectButton
              label="Occupation"
              value={displayLabels.occupation}
              placeholder="Select Occupation"
              onClick={() => setActivePicker('occupation')}
            />

            <TextInput
              label="Organisation"
              value={formData.organisationName}
              onChange={(e) => setFormData((prev) => ({ ...prev, organisationName: e.target.value }))}
              placeholder="Enter organisation name"
            />

            <SelectButton
              label="Interested In Settling Abroad"
              value={displayLabels.interestedInSettlingAbroad}
              placeholder="Select Interested In Settling Abroad"
              onClick={() => setActivePicker('interestedInSettlingAbroad')}
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
        title={activePicker ? `Select ${activePicker.charAt(0).toUpperCase() + activePicker.slice(1).replace(/([A-Z])/g, ' $1')}` : ''}
        options={getPickerOptions()}
        isOpen={activePicker !== null}
        selected={getSelectedLabel()}
        onClose={() => setActivePicker(null)}
        onConfirm={handlePickerConfirm}
      />
    </div>
  )
}

