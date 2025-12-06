import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { SelectButton } from '../components/forms/FormComponents'
import { SelectModal } from '../components/forms/SelectModal'
import { useMyProfileData } from '../hooks/useMyProfileData'
import { useLookup } from '../hooks/useLookup'
import { useApiClient } from '../hooks/useApiClient'
import { showToast } from '../utils/toast'

type PickerField = 'managedBy' | 'disability' | 'bodyType' | 'thalassemia' | 'hivPositive'

export const EditAboutPage = () => {
  const navigate = useNavigate()
  const api = useApiClient()
  const { profile, loading, error } = useMyProfileData()
  const { lookupData, fetchLookup } = useLookup()

  const [formData, setFormData] = useState({
    description: '',
    managedBy: '',
    disability: '',
    bodyType: '',
    thalassemia: '',
    hivPositive: '',
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
      const managedByOptions = lookupData.managedBy || []
      const disabilityOptions = lookupData.disability || []
      const bodyTypeOptions = lookupData.bodyType || []
      const thalassemiaOptions = lookupData.thalassemia || []

      // Find labels for current values
      const managedByLabel = managedByOptions.find((m) => m.value === profile.about.managedBy)?.label || ''
      const disabilityLabel = disabilityOptions.find((d) => d.value === profile.about.disability)?.label || ''
      const bodyTypeLabel = bodyTypeOptions.find((b) => b.value === profile.about.bodyType)?.label || ''
      const thalassemiaLabel = thalassemiaOptions.find((t) => t.value === profile.about.thalassemia)?.label || ''
      const hivPositiveLabel = profile.about.hivPositive === 'Y' ? 'Yes' : profile.about.hivPositive === 'N' ? 'No' : ''

      setDisplayLabels({
        managedBy: managedByLabel,
        disability: disabilityLabel,
        bodyType: bodyTypeLabel,
        thalassemia: thalassemiaLabel,
        hivPositive: hivPositiveLabel,
      })

      setFormData({
        description: profile.about.description || profile.about.aboutYourself || '',
        managedBy: profile.about.managedBy || '',
        disability: profile.about.disability || '',
        bodyType: profile.about.bodyType || '',
        thalassemia: profile.about.thalassemia || '',
        hivPositive: profile.about.hivPositive || '',
      })
    }
  }, [profile, dataLoaded, lookupData])

  // Get lookup options from API response
  const managedByOptions = lookupData.managedBy || []
  const disabilityOptions = lookupData.disability || []
  const bodyTypeOptions = lookupData.bodyType || []
  const thalassemiaOptions = lookupData.thalassemia || []
  const hivPositiveOptions = [
    { label: 'Yes', value: 'Y' },
    { label: 'No', value: 'N' },
  ]

  // Get options for active picker
  const getPickerOptions = (): string[] => {
    if (!activePicker) return []

    switch (activePicker) {
      case 'managedBy':
        return managedByOptions.map((opt) => opt.label)
      case 'disability':
        return disabilityOptions.map((opt) => opt.label)
      case 'bodyType':
        return bodyTypeOptions.map((opt) => opt.label)
      case 'thalassemia':
        return thalassemiaOptions.map((opt) => opt.label)
      case 'hivPositive':
        return hivPositiveOptions.map((opt) => opt.label)
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
      case 'managedBy': {
        const selected = managedByOptions.find((m) => m.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'disability': {
        const selected = disabilityOptions.find((d) => d.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'bodyType': {
        const selected = bodyTypeOptions.find((b) => b.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'thalassemia': {
        const selected = thalassemiaOptions.find((t) => t.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'hivPositive': {
        const selected = hivPositiveOptions.find((h) => h.label === label)
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
      // Prepare payload matching the API structure (exactly as per user's example)
      const updatePayload: any = {
        description: formData.description,
        managedBy: formData.managedBy,
        disability: formData.disability,
        bodyType: formData.bodyType,
        thalassemia: formData.thalassemia,
        hivPositive: formData.hivPositive,
        section: 'about',
      }

      // Remove empty string fields (convert to undefined then remove)
      Object.keys(updatePayload).forEach((key) => {
        if (updatePayload[key] === '' || updatePayload[key] === undefined) {
          delete updatePayload[key]
        }
      })
      
      // Always include section
      updatePayload.section = 'about'

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

  const characterCount = formData.description.length
  const maxCharacters = 500 // Reasonable limit for description
  const isOverLimit = characterCount > maxCharacters

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Edit Profile</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Update your about me information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-4">
            {/* Tell us About YourSelf */}
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Tell us About YourSelf</span>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={8}
                className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white ${
                  isOverLimit ? 'border-red-300 focus:border-red-500' : ''
                }`}
                placeholder="Tell us about yourself..."
              />
              <div className="flex justify-end">
                <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-slate-500'}`}>
                  {characterCount}/{maxCharacters}
                </span>
              </div>
            </label>

            <SelectButton
              label="Profile Managed By"
              value={displayLabels.managedBy}
              placeholder="Select Profile Managed By"
              onClick={() => setActivePicker('managedBy')}
            />

            <SelectButton
              label="Disability"
              value={displayLabels.disability}
              placeholder="Select Disability"
              onClick={() => setActivePicker('disability')}
            />

            <SelectButton
              label="Body Type"
              value={displayLabels.bodyType}
              placeholder="Select Body Type"
              onClick={() => setActivePicker('bodyType')}
            />

            <SelectButton
              label="Thalassemia"
              value={displayLabels.thalassemia}
              placeholder="Select Thalassemia"
              onClick={() => setActivePicker('thalassemia')}
            />

            <SelectButton
              label="HIV Positive"
              value={displayLabels.hivPositive}
              placeholder="Select HIV Positive"
              onClick={() => setActivePicker('hivPositive')}
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

