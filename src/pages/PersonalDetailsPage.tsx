import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { SelectButton, ToggleGroup } from '../components/forms/FormComponents'
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
    gender?: string
    dob?: string
    height?: number
    country?: string
    state?: string
    city?: string
    residence?: string
    motherTongue?: string
    religion?: string
    cast?: string
    horoscope?: string
    manglik?: string
    income?: number
    employed_in?: string
    occupation?: string
    maritalStatus?: string
    haveChildren?: string
    castNoBar?: boolean
    education?: {
      qualification?: string
      otherUGDegree?: string
    }
    [key: string]: any
  }
}

type UpdateResponse = {
  code?: string
  status: string
  message?: string
}

type LookupOption = {
  label: string
  value: string
}

type PickerField =
  | 'country'
  | 'state'
  | 'city'
  | 'residence'
  | 'height'
  | 'education'
  | 'occupation'
  | 'income'
  | 'motherTongue'
  | 'caste'
  | 'horoscope'
  | 'manglik'

export const PersonalDetailsPage = () => {
  const navigate = useNavigate()
  const api = useApiClient()
  const { updateLastActiveScreen } = useUpdateLastActiveScreen()
  const { profile, loading: profileLoading } = useUserProfile()
  const { fetchLookup, fetchCountries, fetchStates, fetchCities, lookupData } = useLookup()

  const [formData, setFormData] = useState({
    gender: '', // No default selection
    dob: '',
    height: '',
    country: '',
    countryValue: '',
    state: '',
    stateValue: '',
    city: '',
    cityValue: '',
    residence: '',
    motherTongue: '',
    religion: 'Hindu',
    cast: '',
    horoscope: '',
    manglik: '',
    income: '',
    employed_in: 'Private Sector',
    occupation: '',
    maritalStatus: 'Never married',
    haveChildren: 'N',
    castNoBar: false,
    education: {
      qualification: '',
      otherUGDegree: '',
    },
  })

  const [activePicker, setActivePicker] = useState<PickerField | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [countries, setCountries] = useState<LookupOption[]>([])
  const [states, setStates] = useState<LookupOption[]>([])
  const [cities, setCities] = useState<LookupOption[]>([])
  const [lookupLoading, setLookupLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Fetch lookup data on mount (only once)
  useEffect(() => {
    if (dataLoaded) return
    
    const loadData = async () => {
      setLookupLoading(true)
      try {
        await fetchLookup()
        const countryList = await fetchCountries()
        setCountries(countryList)
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
  }, [formData.countryValue]) // Only depend on countryValue

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
  }, [formData.stateValue]) // Only depend on stateValue

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
          
          // If screenName is not personaldetails, redirect to correct page
          if (screenName !== 'personaldetails' && routeMap[screenName]) {
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
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        gender: profile.gender || '', // Don't set default if no gender in profile
        // Map other fields from profile if available
      }))
    }
  }, [profile])

  const getPickerOptions = (field: PickerField): string[] => {
    switch (field) {
      case 'country':
        return countries.map((c) => c.label)
      case 'state':
        return states.map((s) => s.label)
      case 'city':
        return cities.map((c) => c.label)
      case 'residence':
        return (
          lookupData.residentialStatus?.map((r) => r.label) || [
            'Citizen',
            'Permanent Resident',
            'Work Permit',
            'Student Visa',
            'Temporary Visa',
          ]
        )
      case 'height':
        return (
          lookupData.height?.map((h) => h.label) || [
            "4'0\"(1.22 mts)",
            "5'0\"(1.52 mts)",
            "6'0\"(1.83 mts)",
          ]
        )
      case 'education':
        return (
          lookupData.highestEducation?.map((e) => e.label) || [
            'B.E/B.Tech',
            'M.E/M.Tech',
            'MBA',
          ]
        )
      case 'occupation':
        return (
          lookupData.occupation?.map((o) => o.label) || [
            'Software Professional',
            'Doctor',
            'Engineer',
          ]
        )
      case 'income':
        return (
          lookupData.income?.map((i) => i.label) || [
            'Rs. 0 - 1 Lakh',
            'Rs. 10 - 15 Lakh',
            'Rs. 25 - 35 Lakh',
          ]
        )
      case 'motherTongue':
        return (
          lookupData.motherTongue?.map((m) => m.label) || [
            'Hindi',
            'English',
            'Tamil',
            'Telugu',
          ]
        )
      case 'caste':
        return lookupData.casts?.map((c) => c.label) || ['Rajput', 'Brahmin', 'Kshatriya']
      case 'horoscope':
        return (
          lookupData.horoscopes?.map((h) => h.label) || [
            'Aries',
            'Taurus',
            'Gemini',
            'Cancer',
          ]
        )
      case 'manglik':
        return (
          lookupData.manglik?.map((m) => m.label) || ['Manglik', 'Non-Manglik', 'Angshik']
        )
      default:
        return []
    }
  }

  const getPickerValue = (field: PickerField): string => {
    switch (field) {
      case 'country':
        return formData.country
      case 'state':
        return formData.state
      case 'city':
        return formData.city
      case 'residence':
        return formData.residence
      case 'height':
        return formData.height
      case 'education':
        return formData.education.qualification
      case 'occupation':
        return formData.occupation
      case 'income':
        return formData.income
      case 'motherTongue':
        return formData.motherTongue
      case 'caste':
        return formData.cast
      case 'horoscope':
        return formData.horoscope
      case 'manglik':
        return formData.manglik
      default:
        return ''
    }
  }

  const setPickerValue = (value: string) => {
    if (!activePicker) return

    switch (activePicker) {
      case 'country': {
        const selected = countries.find((c) => c.label === value)
        setFormData((prev) => ({
          ...prev,
          country: value,
          countryValue: selected?.value || '',
        }))
        break
      }
      case 'state': {
        const selected = states.find((s) => s.label === value)
        setFormData((prev) => ({
          ...prev,
          state: value,
          stateValue: selected?.value || '',
        }))
        break
      }
      case 'city': {
        const selected = cities.find((c) => c.label === value)
        setFormData((prev) => ({
          ...prev,
          city: value,
          cityValue: selected?.value || '',
        }))
        break
      }
      case 'residence': {
        const selected = lookupData.residentialStatus?.find((r) => r.label === value)
        setFormData((prev) => ({
          ...prev,
          residence: selected?.value || value,
        }))
        break
      }
      case 'height': {
        setFormData((prev) => ({
          ...prev,
          height: value,
        }))
        break
      }
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
      case 'motherTongue': {
        const selected = lookupData.motherTongue?.find((m) => m.label === value)
        setFormData((prev) => ({
          ...prev,
          motherTongue: selected?.value || value,
        }))
        break
      }
      case 'caste': {
        const selected = lookupData.casts?.find((c) => c.label === value)
        setFormData((prev) => ({
          ...prev,
          cast: selected?.value || value,
        }))
        break
      }
      case 'horoscope': {
        const selected = lookupData.horoscopes?.find((h) => h.label === value)
        setFormData((prev) => ({
          ...prev,
          horoscope: selected?.value || value,
        }))
        break
      }
      case 'manglik': {
        const selected = lookupData.manglik?.find((m) => m.label === value)
        setFormData((prev) => ({
          ...prev,
          manglik: selected?.value || value,
        }))
        break
      }
    }
    setActivePicker(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    // Validate required fields
    if (!formData.gender) {
      showToast('Please select your gender', 'error')
      return
    }
    
    setSubmitting(true)

    try {
      // Convert DOB to timestamp
      const dobTimestamp = formData.dob ? new Date(formData.dob).getTime() : undefined

      // Get height value from lookup
      const heightOption = lookupData.height?.find((h) => h.label === formData.height)
      const heightValue = heightOption?.value || undefined

      // Get income value from lookup
      const incomeOption = lookupData.income?.find((i) => i.label === formData.income)
      const incomeValue = incomeOption?.value
        ? typeof incomeOption.value === 'number'
          ? incomeOption.value
          : parseFloat(incomeOption.value.toString())
        : undefined

      // Prepare payload
      const payload: any = {
        gender: formData.gender === 'Male' ? 'M' : 'F',
        dob: dobTimestamp,
        height: heightValue,
        employed_in: formData.employed_in === 'Private Sector' ? 'pvtSct' : formData.employed_in,
        country: formData.countryValue || undefined,
        state: formData.stateValue || undefined,
        city: formData.cityValue || undefined,
        motherTongue: formData.motherTongue || undefined,
        religion: formData.religion.toLowerCase().substring(0, 3) || undefined,
        cast: formData.cast || undefined,
        horoscope: formData.horoscope || undefined,
        manglik: formData.manglik.toLowerCase().substring(0, 3) || undefined,
        income: incomeValue,
        residentialStatus: formData.residence || undefined,
        maritalStatus: formData.maritalStatus === 'Never married' ? 'nvm' : formData.maritalStatus,
        occupation: formData.occupation || undefined,
        haveChildren: formData.haveChildren,
        castNoBar: formData.castNoBar,
      }
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

      // Call personalDetails API
      const response = await api.patch<typeof payload, UpdateResponse>('personalDetails', payload)

      if (response.status === 'success' || response.code === 'CH200') {
        showToast('Personal details updated successfully', 'success')

        // Update last active screen
        await updateLastActiveScreen('careerdetails')

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
          const route = routeMap[screenName] || '/dashboard/careerdetails'
          navigate(route, { replace: true })
        } else {
          navigate('/dashboard/careerdetails', { replace: true })
        }
      } else {
        showToast(response.message || 'Failed to update personal details', 'error')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update personal details'
      showToast(message.replace('API ', ''), 'error')
    } finally {
      setSubmitting(false)
    }
  }


  if (profileLoading || lookupLoading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f8f2ff] to-white">
        <div className="rounded-3xl bg-white/90 px-8 py-12 text-center shadow-2xl">
          Loading your details...
        </div>
      </section>
    )
  }

  const renderPickerModal = () => {
    if (!activePicker) return null
    const picker = activePicker
    return (
      <SelectModal
        isOpen
        title={`Select ${picker.charAt(0).toUpperCase() + picker.slice(1)}`}
        options={getPickerOptions(picker)}
        searchable={['country', 'state', 'city', 'occupation', 'caste'].includes(picker)}
        selected={getPickerValue(picker)}
        onClose={() => setActivePicker(null)}
        onConfirm={setPickerValue}
      />
    )
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#f8f2ff] via-white to-white py-10">
      <div className="mx-auto w-full max-w-2xl rounded-[32px] bg-white/95 p-8 shadow-[0_25px_70px_rgba(67,56,202,0.15)]">
        <div className="space-y-4 text-center">
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-full w-[14%] rounded-full bg-gradient-to-r from-[#ff4f8b] to-[#ffa0d2]" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">
              Step 1 of 7
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">Fill in your Personal Details</h1>
            <p className="text-sm text-slate-500">
              Provide additional information like your Date of Birth, Height and Location.
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Basics</p>
            <div className="mt-4 space-y-4">
              <ToggleGroup
                label="Gender"
                value={formData.gender}
                options={['Male', 'Female']}
                onChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                required
              />
              <div className="grid gap-4 md:grid-cols-2">
                {/* altest 18 years old */}
                {/* <TextInput
                  label="Date of Birth"
                  type="date"
                  value={formData.dob}
                  onChange={(event) => setFormData((prev) => ({ ...prev, dob: event.target.value }))}
                  required
                /> */}
                 <TextInput
                  label="Date of Birth"
                  type="date"
                  min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  placeholder="Select date of birth"
                  value={formData.dob ? formData.dob.slice(0, 10) : ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dob: e.target.value ? new Date(e.target.value).toISOString() : '',
                    }))
                  }
                  required
                />
                <SelectButton
                  label="Height"
                  value={formData.height}
                  placeholder="Select height"
                  onClick={() => setActivePicker('height')}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <SelectButton
                  label="Country"
                  value={formData.country}
                  placeholder="Select country"
                  onClick={() => setActivePicker('country')}
                />
                <SelectButton
                  label="State"
                  value={formData.state}
                  placeholder="Select state"
                  onClick={() => setActivePicker('state')}
                  disabled={!formData.countryValue}
                />
                <SelectButton
                  label="City"
                  value={formData.city}
                  placeholder="Select city"
                  onClick={() => setActivePicker('city')}
                  disabled={!formData.stateValue}
                />
                <SelectButton
                  label="Residential Status"
                  value={
                    lookupData.residentialStatus?.find((r) => r.value === formData.residence)?.label ||
                    formData.residence
                  }
                  placeholder="Select residential status"
                  onClick={() => setActivePicker('residence')}
                />
              </div>
            </div>
          </div>

          {/* <div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-inner">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setShowAdvanced((prev) => !prev)}
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">Additional profile preferences</p>
                <p className="text-xs text-slate-500">
                  {showAdvanced ? 'Hide optional fields' : 'Show optional fields'}
                </p>
              </div>
              <span className="text-xl text-pink-500">{showAdvanced ? '−' : '+'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-5 space-y-4">
                <SelectButton
                  label="Mother Tongue"
                  value={
                    lookupData.motherTongue?.find((m) => m.value === formData.motherTongue)?.label ||
                    formData.motherTongue
                  }
                  placeholder="Select mother tongue"
                  onClick={() => setActivePicker('motherTongue')}
                />
                <ToggleGroup
                  label="Religion"
                  value={formData.religion}
                  options={['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Parsi', 'Others']}
                  onChange={(value) => setFormData((prev) => ({ ...prev, religion: value }))}
                />
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={formData.castNoBar}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, castNoBar: event.target.checked }))
                    }
                  />
                  Caste No Bar - I am open to marry people of any caste
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectButton
                    label="Caste"
                    value={
                      lookupData.casts?.find((c) => c.value === formData.cast)?.label || formData.cast
                    }
                    placeholder="Select caste"
                    onClick={() => setActivePicker('caste')}
                  />
                  <SelectButton
                    label="Horoscope"
                    value={
                      lookupData.horoscopes?.find((h) => h.value === formData.horoscope)?.label ||
                      formData.horoscope
                    }
                    placeholder="Select horoscope"
                    onClick={() => setActivePicker('horoscope')}
                  />
                  <SelectButton
                    label="Manglik"
                    value={
                      lookupData.manglik?.find((m) => m.value === formData.manglik)?.label ||
                      formData.manglik
                    }
                    placeholder="Select manglik"
                    onClick={() => setActivePicker('manglik')}
                  />
                  <SelectButton
                    label="Education"
                    value={
                      lookupData.highestEducation?.find((e) => e.value === formData.education.qualification)
                        ?.label || formData.education.qualification
                    }
                    placeholder="Select education"
                    onClick={() => setActivePicker('education')}
                  />
                </div>
                {formData.education.qualification && (
                  <TextInput
                    label="Other Degree"
                    placeholder="Enter other degree"
                    value={formData.education.otherUGDegree}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        education: { ...prev.education, otherUGDegree: event.target.value },
                      }))
                    }
                  />
                )}
                <ToggleGroup
                  label="Employed In"
                  value={formData.employed_in}
                  options={['Private Sector', 'Government', 'Business', 'Not Working']}
                  onChange={(value) => setFormData((prev) => ({ ...prev, employed_in: value }))}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectButton
                    label="Occupation"
                    value={
                      lookupData.occupation?.find((o) => o.value === formData.occupation)?.label ||
                      formData.occupation
                    }
                    placeholder="Select occupation"
                    onClick={() => setActivePicker('occupation')}
                  />
                  <SelectButton
                    label="Income"
                    value={
                      lookupData.income?.find((i) => i.value?.toString() === formData.income)?.label ||
                      formData.income
                    }
                    placeholder="Select income"
                    onClick={() => setActivePicker('income')}
                  />
                </div>
                <ToggleGroup
                  label="Marital Status"
                  value={formData.maritalStatus}
                  options={['Never married', 'Divorced', 'Widowed', 'Annulled', 'Pending divorce']}
                  onChange={(value) => setFormData((prev) => ({ ...prev, maritalStatus: value }))}
                />
                <ToggleGroup
                  label="Have Children"
                  value={formData.haveChildren}
                  options={['Y', 'N']}
                  onChange={(value) => setFormData((prev) => ({ ...prev, haveChildren: value }))}
                />
              </div>
            )}
          </div> */}

          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              className="text-sm font-semibold text-slate-500 hover:text-slate-700"
              onClick={() => navigate(-1)}
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
