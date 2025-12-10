import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { SelectButton } from '../components/forms/FormComponents'
import { SelectModal } from '../components/forms/SelectModal'
import { TextInput } from '../components/forms/TextInput'
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
    education?: {
      qualification?: string
      otherUGDegree?: string
    }
    employed_in?: string
    occupation?: string
    income?: number
    [key: string]: any
  }
}

type UpdateResponse = {
  code?: string
  status: string
  message?: string
}

type PickerField = 'education' | 'occupation' | 'income' | 'employed_in'

export const CareerDetailsPage = () => {
  const navigate = useNavigate()
  const api = useApiClient()
  const { updateLastActiveScreen } = useUpdateLastActiveScreen()
  const { profile, loading: profileLoading } = useUserProfile()
  const { fetchLookup, lookupData } = useLookup()

  const [formData, setFormData] = useState({
    education: {
      qualification: '',
      otherUGDegree: '',
    },
    employed_in: 'pvtSct', // Default to Private Sector value
    occupation: '',
    income: '',
  })

  const [activePicker, setActivePicker] = useState<PickerField | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)

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
          
          // If screenName is not careerdetails, redirect to correct page
          if (screenName !== 'careerdetails' && routeMap[screenName]) {
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

  // Load existing data from profile
  useEffect(() => {
    if (profile && dataLoaded) {
      // Map employed_in value to lookup value if it's a label
      let employedInValue = profile.employed_in || 'pvtSct'
      if (lookupData.employed_in) {
        const foundByLabel = lookupData.employed_in.find((e) => e.label === profile.employed_in)
        if (foundByLabel) {
          employedInValue = foundByLabel.value
        } else {
          // If not found by label, check if it's already a value
          const foundByValue = lookupData.employed_in.find((e) => e.value === profile.employed_in)
          if (foundByValue) {
            employedInValue = foundByValue.value
          }
        }
      }
      
      setFormData((prev) => ({
        ...prev,
        education: {
          qualification: profile.education?.qualification || '',
          otherUGDegree: profile.education?.otherUGDegree || '',
        },
        employed_in: employedInValue,
        occupation: profile.occupation || '',
        income: profile.income?.toString() || '',
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, dataLoaded])

  const getPickerOptions = (field: PickerField): string[] => {
    switch (field) {
      case 'education':
        return lookupData.highestEducation?.map((e) => e.label) || []
      case 'occupation':
        return lookupData.occupation?.map((o) => o.label) || []
      case 'income':
        return lookupData.income?.map((i) => i.label) || []
      case 'employed_in':
        return lookupData.employed_in?.map((e) => e.label) || []
      default:
        return []
    }
  }

  const getPickerValue = (field: PickerField): string => {
    switch (field) {
      case 'education':
        return (
          lookupData.highestEducation?.find((e) => e.value === formData.education.qualification)
            ?.label || formData.education.qualification
        )
      case 'occupation':
        return (
          lookupData.occupation?.find((o) => o.value === formData.occupation)?.label ||
          formData.occupation
        )
      case 'income':
        return (
          lookupData.income?.find((i) => i.value?.toString() === formData.income)?.label ||
          formData.income
        )
      case 'employed_in':
        return (
          lookupData.employed_in?.find((e) => e.value === formData.employed_in)?.label ||
          formData.employed_in
        )
      default:
        return ''
    }
  }

  const setPickerValue = (value: string) => {
    if (!activePicker) return

    switch (activePicker) {
      case 'education': {
        const selected = lookupData.highestEducation?.find((e) => e.label === value)
        setFormData((prev) => ({
          ...prev,
          education: { ...prev.education, qualification: selected?.value || value },
        }))
        break
      }
      case 'occupation': {
        const selected = lookupData.occupation?.find((o) => o.label === value)
        setFormData((prev) => ({
          ...prev,
          occupation: selected?.value || value,
        }))
        break
      }
      case 'income': {
        const selected = lookupData.income?.find((i) => i.label === value)
        setFormData((prev) => ({
          ...prev,
          income: selected?.value?.toString() || value,
        }))
        break
      }
      case 'employed_in': {
        const selected = lookupData.employed_in?.find((e) => e.label === value)
        setFormData((prev) => ({
          ...prev,
          employed_in: selected?.value || value,
        }))
        break
      }
    }
    setActivePicker(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      // Get income value - formData.income is already the lookup value (string), convert to number
      let incomeValue: number | undefined
      if (formData.income) {
        // Try to find by value first (since formData.income stores the value)
        const incomeOption = lookupData.income?.find(
          (i) => i.value?.toString() === formData.income || i.label === formData.income
        )
        if (incomeOption?.value) {
          incomeValue = typeof incomeOption.value === 'number' 
            ? incomeOption.value 
            : parseFloat(incomeOption.value.toString())
        } else {
          // If not found, try parsing the formData.income directly
          const parsed = parseFloat(formData.income)
          if (!isNaN(parsed)) {
            incomeValue = parsed
          }
        }
      }

      // Prepare payload
      const payload: any = {
        employed_in: formData.employed_in || undefined,
        occupation: formData.occupation || undefined,
        income: incomeValue,
      }

      // Always include education if qualification exists
      if (formData.education.qualification) {
        payload.education = {
          qualification: formData.education.qualification,
          otherUGDegree: formData.education.otherUGDegree || undefined,
        }
      }

      // Remove undefined fields
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key]
      })

      // Call personalDetails API (career details are part of personalDetails)
      const response = await api.patch<typeof payload, UpdateResponse>('personalDetails', payload)

      if (response.status === 'success' || response.code === 'CH200') {
        showToast('Career details updated successfully', 'success')

        // Update last active screen
        await updateLastActiveScreen('socialdetails')

        // Get user data and navigate
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
          const route = routeMap[screenName] || '/dashboard/socialdetails'
          navigate(route, { replace: true })
        } else {
          navigate('/dashboard/socialdetails', { replace: true })
        }
      } else {
        showToast(response.message || 'Failed to update career details', 'error')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update career details'
      showToast(message.replace('API ', ''), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (profileLoading || lookupLoading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f8f2ff] to-white">
        <div className="rounded-3xl bg-white/90 px-8 py-12 text-center shadow-2xl">
          Loading your career info...
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#f8f2ff] via-white to-white py-10">
      <div className="mx-auto w-full max-w-2xl rounded-[32px] bg-white/95 p-8 shadow-[0_25px_70px_rgba(67,56,202,0.15)]">
        <div className="space-y-4 text-center">
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-full w-[28%] rounded-full bg-gradient-to-r from-[#ff4f8b] to-[#ffa0d2]" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">
              Step 2 of 7
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">Fill in your Career Details</h1>
            <p className="text-sm text-slate-500">
              Provide additional information like your education, profession and income.
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Education</p>
            <div className="mt-4 space-y-4">
              <SelectButton
                label="Highest Qualification"
                value={getPickerValue('education')}
                placeholder="Select education"
                onClick={() => setActivePicker('education')}
              />
              {formData.education.qualification && (
                <TextInput
                  label="Other UG Degree"
                  placeholder="Enter degree name"
                  value={formData.education.otherUGDegree}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      education: { ...prev.education, otherUGDegree: event.target.value },
                    }))
                  }
                />
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Work Experience
            </p>
            <div className="mt-4 space-y-4">
              <SelectButton
                label="Employed In"
                value={getPickerValue('employed_in')}
                placeholder="Select Employed In"
                onClick={() => setActivePicker('employed_in')}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <SelectButton
                  label="Occupation"
                  value={getPickerValue('occupation')}
                  placeholder="Select occupation"
                  onClick={() => setActivePicker('occupation')}
                />
                <SelectButton
                  label="Income"
                  value={getPickerValue('income')}
                  placeholder="Select income"
                  onClick={() => setActivePicker('income')}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              className="text-sm font-semibold text-slate-500 hover:text-slate-700"
              onClick={() => navigate('/dashboard/personaldetails', { replace: true })}
            >
              ← Back
            </button>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? 'Saving...' : 'Next'}
            </Button>
          </div>
        </form>
      </div>

      {activePicker && (
        <SelectModal
          isOpen
          title={activePicker === 'employed_in' ? 'Select Employed_in' : `Select ${activePicker.charAt(0).toUpperCase() + activePicker.slice(1)}`}
          options={getPickerOptions(activePicker)}
          searchable={['occupation', 'employed_in'].includes(activePicker)}
          selected={getPickerValue(activePicker)}
          onClose={() => setActivePicker(null)}
          onConfirm={setPickerValue}
        />
      )}
    </section>
  )
}
