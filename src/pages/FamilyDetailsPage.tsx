import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { CountSelector, SelectButton } from '../components/forms/FormComponents'
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
    [key: string]: any
  }
}

type PickerField =
  | 'familyStatus'
  | 'familyType'
  | 'familyValues'
  | 'familyIncome'
  | 'fatherOccupation'
  | 'motherOccupation'
  | 'livingWithParents'
  | 'familyBaseLocation'

export const FamilyDetailsPage = () => {
  const navigate = useNavigate()
  const api = useApiClient()
  const { updateLastActiveScreen } = useUpdateLastActiveScreen()
  const { loading: profileLoading } = useUserProfile()
  const { fetchLookup, lookupData } = useLookup()

  const [formData, setFormData] = useState({
    familyStatus: '',
    familyType: '',
    familyValues: '',
    familyIncome: '',
    fatherOccupation: '',
    motherOccupation: '',
    brothers: 0,
    sisters: 0,
    marriedBrothers: 0,
    marriedSisters: 0,
    livingWithParents: 'Y',
    gothra: '',
    familyBaseLocation: '',
    familyBaseLocationValue: '',
  })

  const [activePicker, setActivePicker] = useState<PickerField | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [countries, setCountries] = useState<{ label: string; value: string }[]>([])

  // Fetch lookup data on mount (only once)
  useEffect(() => {
    if (dataLoaded) return

    const loadData = async () => {
      setLookupLoading(true)
      try {
        await fetchLookup()
        const countryList = await api.get<{ label: string; value: string }[]>('lookup/getCountryLookup')
        setCountries(countryList)
        setDataLoaded(true)
      } catch (error) {
        console.error('Error loading family lookup data:', error)
      } finally {
        setLookupLoading(false)
      }
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

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
          
          // If screenName is not familydetails, redirect to correct page
          if (screenName !== 'familydetails' && routeMap[screenName]) {
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

  const getPickerOptions = (field: PickerField): string[] => {
    switch (field) {
      case 'familyStatus':
        return lookupData.familyStatus?.map((f) => f.label) || []
      case 'familyType':
        return lookupData.familyType?.map((f) => f.label) || []
      case 'familyValues':
        return lookupData.familyValues?.map((f) => f.label) || []
      case 'familyIncome':
        return lookupData.income?.map((i) => i.label) || ['Rs. 0 - 1 Lakh']
      case 'fatherOccupation':
        return lookupData.fathersOccupation?.map((f) => f.label) || []
      case 'motherOccupation':
        return lookupData.mothersOccupation?.map((m) => m.label) || []
      case 'livingWithParents':
        return lookupData.livingWithParents?.map((l) => l.label) || ['Yes', 'No']
      case 'familyBaseLocation':
        return countries.map((c) => c.label)
      default:
        return []
    }
  }

  const getPickerValue = (field: PickerField): string => {
    switch (field) {
      case 'familyStatus':
        return (
          lookupData.familyStatus?.find((f) => f.value === formData.familyStatus)?.label ||
          formData.familyStatus
        )
      case 'familyType':
        return (
          lookupData.familyType?.find((f) => f.value === formData.familyType)?.label ||
          formData.familyType
        )
      case 'familyValues':
        return (
          lookupData.familyValues?.find((f) => f.value === formData.familyValues)?.label ||
          formData.familyValues
        )
      case 'fatherOccupation':
        return (
          lookupData.fathersOccupation?.find((f) => f.value === formData.fatherOccupation)?.label ||
          formData.fatherOccupation
        )
      case 'motherOccupation':
        return (
          lookupData.mothersOccupation?.find((m) => m.value === formData.motherOccupation)?.label ||
          formData.motherOccupation
        )
      case 'livingWithParents':
        return (
          lookupData.livingWithParents?.find((l) => l.value === formData.livingWithParents)?.label ||
          formData.livingWithParents
        )
      case 'familyBaseLocation':
        return (
          countries.find((c) => c.value === formData.familyBaseLocationValue)?.label ||
          formData.familyBaseLocation
        )
      default:
        return ''
    }
  }

  const setPickerValue = (value: string) => {
    if (!activePicker) return

    switch (activePicker) {
      case 'familyStatus': {
        const selected = lookupData.familyStatus?.find((f) => f.label === value)
        setFormData((prev) => ({ ...prev, familyStatus: selected?.value || value }))
        break
      }
      case 'familyType': {
        const selected = lookupData.familyType?.find((f) => f.label === value)
        setFormData((prev) => ({ ...prev, familyType: selected?.value || value }))
        break
      }
      case 'familyValues': {
        const selected = lookupData.familyValues?.find((f) => f.label === value)
        setFormData((prev) => ({ ...prev, familyValues: selected?.value || value }))
        break
      }
      case 'familyIncome': {
        const selected = lookupData.income?.find((i) => i.label === value)
        setFormData((prev) => ({ ...prev, familyIncome: selected?.value?.toString() || value }))
        break
      }
      case 'fatherOccupation': {
        const selected = lookupData.fathersOccupation?.find((f) => f.label === value)
        setFormData((prev) => ({ ...prev, fatherOccupation: selected?.value || value }))
        break
      }
      case 'motherOccupation': {
        const selected = lookupData.mothersOccupation?.find((m) => m.label === value)
        setFormData((prev) => ({ ...prev, motherOccupation: selected?.value || value }))
        break
      }
      case 'livingWithParents': {
        const selected = lookupData.livingWithParents?.find((l) => l.label === value)
        setFormData((prev) => ({ ...prev, livingWithParents: selected?.value || value }))
        break
      }
      case 'familyBaseLocation': {
        const selected = countries.find((c) => c.label === value)
        setFormData((prev) => ({
          ...prev,
          familyBaseLocation: value,
          familyBaseLocationValue: selected?.value || '',
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
      // Get familyIncome as number from lookup
      let familyIncomeValue: number | undefined
      if (formData.familyIncome) {
        const incomeOption = lookupData.income?.find(
          (i) => i.value?.toString() === formData.familyIncome || i.label === formData.familyIncome
        )
        if (incomeOption?.value) {
          familyIncomeValue = typeof incomeOption.value === 'number'
            ? incomeOption.value
            : parseFloat(incomeOption.value.toString())
        } else {
          const parsed = parseFloat(formData.familyIncome)
          if (!isNaN(parsed)) {
            familyIncomeValue = parsed
          }
        }
      }

      const payload: any = {
        familyStatus: formData.familyStatus || undefined,
        familyType: formData.familyType || undefined,
        familyValues: formData.familyValues || undefined,
        familyIncome: familyIncomeValue,
        fatherOccupation: formData.fatherOccupation || undefined,
        motherOccupation: formData.motherOccupation || undefined,
        brothers: formData.brothers,
        sisters: formData.sisters,
        marriedBrothers: formData.marriedBrothers,
        marriedSisters: formData.marriedSisters,
        livingWithParents: formData.livingWithParents || undefined,
        gothra: formData.gothra || undefined,
        familyBasedOutOf: formData.familyBaseLocationValue || undefined,
      }

      // Remove undefined fields
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key]
      })

      const response = await api.patch<typeof payload, { status?: string; code?: string; message?: string }>('family', payload)

      if (response.status === 'success' || response.code === 'CH200') {
        showToast('Family details updated successfully', 'success')
        await updateLastActiveScreen('partnerpreferences')
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
          const route = routeMap[screenName] || '/dashboard/partnerpreferences'
          navigate(route, { replace: true })
        } else {
          navigate('/dashboard/partnerpreferences', { replace: true })
        }
      } else {
        showToast(response.message || 'Failed to update family details', 'error')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update family details'
      showToast(message.replace('API ', ''), 'error')
    } finally {
      setSubmitting(false)
    }
  }

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
          Loading your family details...
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#f8f2ff] via-white to-white py-10">
      <div className="mx-auto w-full max-w-2xl rounded-[32px] bg-white/95 p-8 shadow-[0_25px_70px_rgba(67,56,202,0.15)]">
        <div className="space-y-4 text-center">
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-[#ff4f8b] to-[#ffa0d2]" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">
              Step 5 of 7
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">Family details</h1>
            <p className="text-sm text-slate-500">Provide additional information about your family.</p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Family background</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <SelectButton
                label="Family Status"
                value={getPickerValue('familyStatus')}
                placeholder="Select family status"
                onClick={() => setActivePicker('familyStatus')}
              />
              <SelectButton
                label="Family Type"
                value={getPickerValue('familyType')}
                placeholder="Select family type"
                onClick={() => setActivePicker('familyType')}
              />
              <SelectButton
                label="Family Values"
                value={getPickerValue('familyValues')}
                placeholder="Select family values"
                onClick={() => setActivePicker('familyValues')}
              />
              <SelectButton
                label="Family Income"
                value={
                  lookupData.income?.find((i) => i.value?.toString() === formData.familyIncome)?.label ||
                  formData.familyIncome
                }
                placeholder="Select family income"
                onClick={() => setActivePicker('familyIncome')}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-inner space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Family members</p>
            <div className="grid gap-4 md:grid-cols-2">
              <SelectButton
                label="Father's Occupation"
                value={getPickerValue('fatherOccupation')}
                placeholder="Select father's occupation"
                onClick={() => setActivePicker('fatherOccupation')}
              />
              <SelectButton
                label="Mother's Occupation"
                value={getPickerValue('motherOccupation')}
                placeholder="Select mother's occupation"
                onClick={() => setActivePicker('motherOccupation')}
              />
            </div>
            <CountSelector
              label="Brothers"
              value={formData.brothers}
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
            <SelectButton
              label="Living with parents"
              value={getPickerValue('livingWithParents')}
              placeholder="Select option"
              onClick={() => setActivePicker('livingWithParents')}
            />
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-inner space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Additional details</p>
            <TextInput
              label="Gothra"
              placeholder="Enter gothra"
              value={formData.gothra}
              onChange={(event) => setFormData((prev) => ({ ...prev, gothra: event.target.value }))}
            />
            <SelectButton
              label="My family based out of"
              value={getPickerValue('familyBaseLocation')}
              placeholder="Select country"
              onClick={() => setActivePicker('familyBaseLocation')}
            />
          </div>

          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              className="text-sm font-semibold text-slate-500 hover:text-slate-700"
              onClick={() => navigate('/dashboard/srcmdetails', { replace: true })}
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
