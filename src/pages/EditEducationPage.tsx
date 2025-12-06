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

type PickerField = 'qualification'

export const EditEducationPage = () => {
  const navigate = useNavigate()
  const api = useApiClient()
  const { profile, loading, error } = useMyProfileData()
  const { lookupData, fetchLookup } = useLookup()

  const [formData, setFormData] = useState({
    aboutEducation: '',
    qualification: '',
    otherUGDegree: '',
    school: '',
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
      const qualificationOptions = lookupData.highestEducation || lookupData.qualification || []

      // Find label for current value
      const qualificationLabel = qualificationOptions.find((q) => q.value === profile.education.qualification)?.label || ''

      setDisplayLabels({
        qualification: qualificationLabel,
      })

      setFormData({
        aboutEducation: profile.education.aboutEducation || '',
        qualification: profile.education.qualification || '',
        otherUGDegree: profile.education.otherUGDegree || '',
        school: profile.education.school || '',
      })
    }
  }, [profile, dataLoaded, lookupData])

  // Get lookup options from API response
  const qualificationOptions = lookupData.highestEducation || lookupData.qualification || []

  // Get options for active picker
  const getPickerOptions = (): string[] => {
    if (!activePicker) return []

    switch (activePicker) {
      case 'qualification':
        return qualificationOptions.map((opt) => opt.label)
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
      case 'qualification': {
        const selected = qualificationOptions.find((q) => q.label === label)
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
        aboutEducation: formData.aboutEducation || undefined,
        qualification: formData.qualification || undefined,
        otherUGDegree: formData.otherUGDegree || undefined,
        school: formData.school || undefined,
        section: 'education',
      }

      // Remove empty string fields (convert to undefined then remove)
      Object.keys(updatePayload).forEach((key) => {
        if (updatePayload[key] === '' || updatePayload[key] === undefined) {
          delete updatePayload[key]
        }
      })

      // Always include section
      updatePayload.section = 'education'

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

  const characterCount = formData.aboutEducation.length
  const maxCharacters = 125
  const isOverLimit = characterCount > maxCharacters

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Edit Profile</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Update your education information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-4">
            {/* About My Education */}
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">About My Education</span>
              <textarea
                value={formData.aboutEducation}
                onChange={(e) => setFormData((prev) => ({ ...prev, aboutEducation: e.target.value }))}
                rows={6}
                maxLength={maxCharacters}
                className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white ${
                  isOverLimit ? 'border-red-300 focus:border-red-500' : ''
                }`}
                placeholder="Tell us about your education..."
              />
              <div className="flex justify-end">
                <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-slate-500'}`}>
                  {characterCount} / {maxCharacters}
                </span>
              </div>
            </label>

            <SelectButton
              label="Highest Degree"
              value={displayLabels.qualification}
              placeholder="Select Highest Degree"
              onClick={() => setActivePicker('qualification')}
            />

            <TextInput
              label="Other UG Degree"
              value={formData.otherUGDegree}
              onChange={(e) => setFormData((prev) => ({ ...prev, otherUGDegree: e.target.value }))}
              placeholder="Enter other UG degree"
            />

            <TextInput
              label="School"
              value={formData.school}
              onChange={(e) => setFormData((prev) => ({ ...prev, school: e.target.value }))}
              placeholder="Enter school name"
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
        title="Select Highest Degree"
        options={getPickerOptions()}
        isOpen={activePicker !== null}
        selected={getSelectedLabel()}
        onClose={() => setActivePicker(null)}
        onConfirm={handlePickerConfirm}
      />
    </div>
  )
}

