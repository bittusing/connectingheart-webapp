import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { SelectButton, CountSelector } from '../components/forms/FormComponents'
import { SelectModal } from '../components/forms/SelectModal'
import { TextInput } from '../components/forms/TextInput'
import { useMyProfileData } from '../hooks/useMyProfileData'
import { useLookup } from '../hooks/useLookup'
import { useCountryLookup } from '../hooks/useCountryLookup'
import { useApiClient } from '../hooks/useApiClient'
import { showToast } from '../utils/toast'

type PickerField =
  | 'familyStatus'
  | 'familyType'
  | 'familyValues'
  | 'familyIncome'
  | 'fatherOccupation'
  | 'motherOccupation'
  | 'livingWithParents'
  | 'familyBasedOutOf'

export const EditFamilyPage = () => {
  const navigate = useNavigate()
  const api = useApiClient()
  const { profile, loading, error } = useMyProfileData()
  const { lookupData, fetchLookup } = useLookup()
  const { countries: countryOptions } = useCountryLookup()

  const [formData, setFormData] = useState({
    aboutMyFamily: '',
    familyStatus: '',
    familyType: '',
    familyValues: '',
    familyIncome: '',
    fatherOccupation: '',
    motherOccupation: '',
    brothers: 0,
    marriedBrothers: 0,
    sisters: 0,
    marriedSisters: 0,
    gothra: '',
    livingWithParents: '',
    familyBasedOutOf: '',
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
      const familyStatusOptions = lookupData.familyStatus || []
      const familyTypeOptions = lookupData.familyType || []
      const familyValuesOptions = lookupData.familyValues || []
      const incomeOptions = lookupData.income || []
      const fatherOccupationOptions = lookupData.fathersOccupation || lookupData.occupation || []
      const motherOccupationOptions = lookupData.mothersOccupation || lookupData.occupation || []

      // Find labels for current values
      const familyStatusLabel = familyStatusOptions.find((f) => f.value === profile.family.familyStatus)?.label || ''
      const familyTypeLabel = familyTypeOptions.find((f) => f.value === profile.family.familyType)?.label || ''
      const familyValuesLabel = familyValuesOptions.find((f) => f.value === profile.family.familyValues)?.label || ''
      const familyIncomeLabel = incomeOptions.find((i) => String(i.value) === String(profile.family.familyIncome))?.label || ''
      const fatherOccupationLabel = fatherOccupationOptions.find((f) => f.value === profile.family.fatherOccupation)?.label || ''
      const motherOccupationLabel = motherOccupationOptions.find((m) => m.value === profile.family.motherOccupation)?.label || ''
      const livingWithParentsLabel = profile.family.livingWithParents === 'Y' ? 'Yes' : profile.family.livingWithParents === 'N' ? 'No' : ''
      const familyBasedOutOfLabel = countryOptions.find((c) => c.value === profile.family.familyBasedOutOf)?.label || ''

      setDisplayLabels({
        familyStatus: familyStatusLabel,
        familyType: familyTypeLabel,
        familyValues: familyValuesLabel,
        familyIncome: familyIncomeLabel,
        fatherOccupation: fatherOccupationLabel,
        motherOccupation: motherOccupationLabel,
        livingWithParents: livingWithParentsLabel,
        familyBasedOutOf: familyBasedOutOfLabel,
      })

      setFormData({
        aboutMyFamily: profile.family.aboutMyFamily || profile.family.aboutFamily || '',
        familyStatus: profile.family.familyStatus || '',
        familyType: profile.family.familyType || '',
        familyValues: profile.family.familyValues || '',
        familyIncome: profile.family.familyIncome ? String(profile.family.familyIncome) : '',
        fatherOccupation: profile.family.fatherOccupation || '',
        motherOccupation: profile.family.motherOccupation || '',
        brothers: parseInt(profile.family.brothers || '0', 10),
        marriedBrothers: parseInt(profile.family.marriedBrothers || '0', 10),
        sisters: parseInt(profile.family.sisters || '0', 10),
        marriedSisters: parseInt(profile.family.marriedSisters || '0', 10),
        gothra: profile.family.gothra || '',
        livingWithParents: profile.family.livingWithParents || '',
        familyBasedOutOf: profile.family.familyBasedOutOf || '',
      })
    }
  }, [profile, dataLoaded, lookupData, countryOptions])

  // Get lookup options from API response
  const familyStatusOptions = lookupData.familyStatus || []
  const familyTypeOptions = lookupData.familyType || []
  const familyValuesOptions = lookupData.familyValues || []
  const incomeOptions = lookupData.income || []
  const fatherOccupationOptions = lookupData.fathersOccupation || lookupData.occupation || []
  const motherOccupationOptions = lookupData.mothersOccupation || lookupData.occupation || []
  const livingWithParentsOptions = [
    { label: 'Yes', value: 'Y' },
    { label: 'No', value: 'N' },
  ]

  // Get options for active picker
  const getPickerOptions = (): string[] => {
    if (!activePicker) return []

    switch (activePicker) {
      case 'familyStatus':
        return familyStatusOptions.map((opt) => opt.label)
      case 'familyType':
        return familyTypeOptions.map((opt) => opt.label)
      case 'familyValues':
        return familyValuesOptions.map((opt) => opt.label)
      case 'familyIncome':
        return incomeOptions.map((opt) => opt.label)
      case 'fatherOccupation':
        return fatherOccupationOptions.map((opt) => opt.label)
      case 'motherOccupation':
        return motherOccupationOptions.map((opt) => opt.label)
      case 'livingWithParents':
        return livingWithParentsOptions.map((opt) => opt.label)
      case 'familyBasedOutOf':
        return countryOptions.map((opt) => opt.label)
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
      case 'familyStatus': {
        const selected = familyStatusOptions.find((f) => f.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'familyType': {
        const selected = familyTypeOptions.find((f) => f.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'familyValues': {
        const selected = familyValuesOptions.find((f) => f.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'familyIncome': {
        const selected = incomeOptions.find((i) => i.label === label)
        selectedValue = selected?.value ? String(selected.value) : ''
        break
      }
      case 'fatherOccupation': {
        const selected = fatherOccupationOptions.find((f) => f.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'motherOccupation': {
        const selected = motherOccupationOptions.find((m) => m.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'livingWithParents': {
        const selected = livingWithParentsOptions.find((l) => l.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'familyBasedOutOf': {
        const selected = countryOptions.find((c) => c.label === label)
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
        aboutMyFamily: formData.aboutMyFamily || undefined,
        familyStatus: formData.familyStatus || undefined,
        familyType: formData.familyType || undefined,
        familyValues: formData.familyValues || undefined,
        familyIncome: formData.familyIncome ? parseInt(formData.familyIncome, 10) : undefined,
        fatherOccupation: formData.fatherOccupation || undefined,
        motherOccupation: formData.motherOccupation || undefined,
        brothers: formData.brothers > 0 ? String(formData.brothers) : undefined,
        marriedBrothers: formData.marriedBrothers > 0 ? String(formData.marriedBrothers) : undefined,
        sisters: formData.sisters > 0 ? String(formData.sisters) : undefined,
        marriedSisters: formData.marriedSisters > 0 ? String(formData.marriedSisters) : undefined,
        gothra: formData.gothra || undefined,
        livingWithParents: formData.livingWithParents || undefined,
        familyBasedOutOf: formData.familyBasedOutOf || undefined,
        section: 'family',
      }

      // Remove empty string fields (convert to undefined then remove)
      Object.keys(updatePayload).forEach((key) => {
        if (updatePayload[key] === '' || updatePayload[key] === undefined) {
          delete updatePayload[key]
        }
      })

      // Always include section
      updatePayload.section = 'family'

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

  const characterCount = formData.aboutMyFamily.length
  const maxCharacters = 125
  const isOverLimit = characterCount > maxCharacters

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Edit Profile</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Update your family information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-4">
            {/* About My Family */}
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">About My Family</span>
              <textarea
                value={formData.aboutMyFamily}
                onChange={(e) => setFormData((prev) => ({ ...prev, aboutMyFamily: e.target.value }))}
                rows={6}
                maxLength={maxCharacters}
                className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white ${
                  isOverLimit ? 'border-red-300 focus:border-red-500' : ''
                }`}
                placeholder="Tell us about your family..."
              />
              <div className="flex justify-end">
                <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-slate-500'}`}>
                  {characterCount} / {maxCharacters}
                </span>
              </div>
            </label>

            <SelectButton
              label="Family Status"
              value={displayLabels.familyStatus}
              placeholder="Select Family Status"
              onClick={() => setActivePicker('familyStatus')}
            />

            <SelectButton
              label="Family Type"
              value={displayLabels.familyType}
              placeholder="Select Family Type"
              onClick={() => setActivePicker('familyType')}
            />

            <SelectButton
              label="Family Values"
              value={displayLabels.familyValues}
              placeholder="Select Family Values"
              onClick={() => setActivePicker('familyValues')}
            />

            <SelectButton
              label="Family Income"
              value={displayLabels.familyIncome}
              placeholder="Select Family Income"
              onClick={() => setActivePicker('familyIncome')}
            />

            <SelectButton
              label="Father Occupation"
              value={displayLabels.fatherOccupation}
              placeholder="Select Father Occupation"
              onClick={() => setActivePicker('fatherOccupation')}
            />

            <SelectButton
              label="Mother Occupation"
              value={displayLabels.motherOccupation}
              placeholder="Select Mother Occupation"
              onClick={() => setActivePicker('motherOccupation')}
            />

            <CountSelector
              label="Brothers"
              value={formData.brothers}
              max={10}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  brothers: value,
                  marriedBrothers: Math.min(prev.marriedBrothers, value),
                }))
              }
            />

            {formData.brothers > 0 && (
              <CountSelector
                label="Married Brothers"
                value={formData.marriedBrothers}
                max={formData.brothers}
                onChange={(value) => setFormData((prev) => ({ ...prev, marriedBrothers: value }))}
              />
            )}

            <CountSelector
              label="Sisters"
              value={formData.sisters}
              max={10}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  sisters: value,
                  marriedSisters: Math.min(prev.marriedSisters, value),
                }))
              }
            />

            {formData.sisters > 0 && (
              <CountSelector
                label="Married Sisters"
                value={formData.marriedSisters}
                max={formData.sisters}
                onChange={(value) => setFormData((prev) => ({ ...prev, marriedSisters: value }))}
              />
            )}

            <TextInput
              label="Gothra"
              value={formData.gothra}
              onChange={(e) => setFormData((prev) => ({ ...prev, gothra: e.target.value }))}
              placeholder="Enter gothra"
            />

            <SelectButton
              label="I am Living with Parents"
              value={displayLabels.livingWithParents}
              placeholder="Select Living with Parents"
              onClick={() => setActivePicker('livingWithParents')}
            />

            <SelectButton
              label="My Family Based Out of"
              value={displayLabels.familyBasedOutOf}
              placeholder="Select Family Based Out of"
              onClick={() => setActivePicker('familyBasedOutOf')}
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

