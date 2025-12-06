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
import type { LookupOption } from '../types/api'

type PickerField =
  | 'dietaryHabits'
  | 'drinkingHabits'
  | 'smokingHabits'
  | 'ownAHouse'
  | 'ownACar'
  | 'openToPets'

// MultiSelectField component for multi-select with chips
const MultiSelectField = ({
  label,
  placeholder,
  options,
  selectedValues,
  onChange,
}: {
  label: string
  placeholder: string
  options: LookupOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const availableOptions = options.filter((option) => !selectedValues.includes(String(option.value)))
  const filteredOptions = availableOptions.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase()),
  )

  const handleRemove = (value: string) => {
    onChange(selectedValues.filter((item) => item !== value))
  }

  const handleAdd = (value: string) => {
    if (!value) return
    onChange([...selectedValues, String(value)])
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
      <div className="relative rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap gap-2">
          {selectedValues.map((value) => {
            const option = options.find((item) => String(item.value) === value)
            const displayLabel = option?.label ?? value
            return (
              <span
                key={`${label}-${value}`}
                className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1 text-sm font-medium text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
              >
                {displayLabel}
                <button
                  type="button"
                  onClick={() => handleRemove(value)}
                  className="text-base leading-none text-pink-500 dark:text-pink-400"
                  aria-label={`Remove ${displayLabel}`}
                >
                  ×
                </button>
              </span>
            )
          })}
          <button
            type="button"
            className="min-w-[160px] flex-1 rounded-full border border-dashed border-slate-300 px-3 py-1 text-left text-sm text-slate-500 hover:border-pink-400 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-500 dark:border-slate-600 dark:text-slate-400 dark:hover:border-pink-500 dark:hover:text-slate-300"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {availableOptions.length ? placeholder : 'No options available'}
          </button>
        </div>
        {isOpen && availableOptions.length > 0 && (
          <div className="absolute left-3 right-3 top-full z-20 mt-2 max-h-60 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-100 bg-slate-50/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/80">
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                placeholder="Search..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
              {filteredOptions.length === 0 && (
                <div className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500">No matches found</div>
              )}
              {filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-slate-700 hover:bg-pink-50 dark:text-slate-100 dark:hover:bg-slate-700/50"
                  onClick={() => handleAdd(String(option.value))}
                >
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const EditLifestylePage = () => {
  const navigate = useNavigate()
  const api = useApiClient()
  const { profile, loading, error } = useMyProfileData()
  const { lookupData, fetchLookup } = useLookup()

  const [formData, setFormData] = useState({
    dietaryHabits: '',
    drinkingHabits: '',
    smokingHabits: '',
    ownAHouse: '',
    ownACar: '',
    openToPets: '',
    languages: [] as string[],
    hobbies: [] as string[],
    interest: [] as string[],
    foodICook: '',
    favMusic: [] as string[],
    favRead: '',
    dress: [] as string[],
    sports: [] as string[],
    books: [] as string[],
    cuisine: [] as string[],
    movies: '',
    favTVShow: '',
    vacayDestination: '',
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
      const dietaryHabitsOptions = lookupData.dietaryHabits || []
      const drinkingHabitsOptions = lookupData.drinkingHabits || []
      const smokingHabitsOptions = lookupData.smokingHabits || []
      const yesNoOptions = [
        { label: 'Yes', value: 'Y' },
        { label: 'No', value: 'N' },
      ]

      // Find labels for current values
      const dietaryHabitsLabel = dietaryHabitsOptions.find((d) => d.value === profile.lifeStyleData.dietaryHabits)?.label || ''
      const drinkingHabitsLabel = drinkingHabitsOptions.find((d) => d.value === profile.lifeStyleData.drinkingHabits)?.label || ''
      const smokingHabitsLabel = smokingHabitsOptions.find((s) => s.value === profile.lifeStyleData.smokingHabits)?.label || ''
      const ownAHouseLabel = profile.lifeStyleData.ownAHouse === 'Y' ? 'Yes' : profile.lifeStyleData.ownAHouse === 'N' ? 'No' : ''
      const ownACarLabel = profile.lifeStyleData.ownACar === 'Y' ? 'Yes' : profile.lifeStyleData.ownACar === 'N' ? 'No' : ''
      const openToPetsLabel = profile.lifeStyleData.openToPets === 'Y' ? 'Yes' : profile.lifeStyleData.openToPets === 'N' ? 'No' : ''

      setDisplayLabels({
        dietaryHabits: dietaryHabitsLabel,
        drinkingHabits: drinkingHabitsLabel,
        smokingHabits: smokingHabitsLabel,
        ownAHouse: ownAHouseLabel,
        ownACar: ownACarLabel,
        openToPets: openToPetsLabel,
      })

      setFormData({
        dietaryHabits: profile.lifeStyleData.dietaryHabits || '',
        drinkingHabits: profile.lifeStyleData.drinkingHabits || '',
        smokingHabits: profile.lifeStyleData.smokingHabits || '',
        ownAHouse: profile.lifeStyleData.ownAHouse || '',
        ownACar: profile.lifeStyleData.ownACar || '',
        openToPets: profile.lifeStyleData.openToPets || '',
        languages: profile.lifeStyleData.languages?.map((l) => String(l)) || [],
        hobbies: profile.lifeStyleData.hobbies?.map((h) => String(h)) || [],
        interest: profile.lifeStyleData.interest?.map((i) => String(i)) || [],
        foodICook: profile.lifeStyleData.foodICook || '',
        favMusic: profile.lifeStyleData.favMusic?.map((m) => String(m)) || [],
        favRead: profile.lifeStyleData.favRead || '',
        dress: profile.lifeStyleData.dress?.map((d) => String(d)) || [],
        sports: profile.lifeStyleData.sports?.map((s) => String(s)) || [],
        books: profile.lifeStyleData.books?.map((b) => String(b)) || [],
        cuisine: profile.lifeStyleData.cuisine?.map((c) => String(c)) || [],
        movies: profile.lifeStyleData.movies || '',
        favTVShow: profile.lifeStyleData.favTVShow || '',
        vacayDestination: profile.lifeStyleData.vacayDestination || '',
      })
    }
  }, [profile, dataLoaded, lookupData])

  // Get lookup options from API response
  const dietaryHabitsOptions = lookupData.dietaryHabits || []
  const drinkingHabitsOptions = lookupData.drinkingHabits || []
  const smokingHabitsOptions = lookupData.smokingHabits || []
  const languagesOptions = lookupData.languages || lookupData.motherTongue || []
  const hobbiesOptions = lookupData.hobbies || []
  const interestsOptions = lookupData.interests || []
  const musicOptions = lookupData.music || []
  const dressOptions = lookupData.dressStyle || []
  const sportsOptions = lookupData.sports || []
  const booksOptions = lookupData.books || []
  const cuisineOptions = lookupData.cuisines || []
  const yesNoOptions = [
    { label: 'Yes', value: 'Y' },
    { label: 'No', value: 'N' },
  ]

  // Get options for active picker
  const getPickerOptions = (): string[] => {
    if (!activePicker) return []

    switch (activePicker) {
      case 'dietaryHabits':
        return dietaryHabitsOptions.map((opt) => opt.label)
      case 'drinkingHabits':
        return drinkingHabitsOptions.map((opt) => opt.label)
      case 'smokingHabits':
        return smokingHabitsOptions.map((opt) => opt.label)
      case 'ownAHouse':
      case 'ownACar':
      case 'openToPets':
        return yesNoOptions.map((opt) => opt.label)
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
      case 'dietaryHabits': {
        const selected = dietaryHabitsOptions.find((d) => d.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'drinkingHabits': {
        const selected = drinkingHabitsOptions.find((d) => d.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'smokingHabits': {
        const selected = smokingHabitsOptions.find((s) => s.label === label)
        selectedValue = selected?.value || ''
        break
      }
      case 'ownAHouse':
      case 'ownACar':
      case 'openToPets': {
        const selected = yesNoOptions.find((y) => y.label === label)
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
        dietaryHabits: formData.dietaryHabits || undefined,
        drinkingHabits: formData.drinkingHabits || undefined,
        smokingHabits: formData.smokingHabits || undefined,
        ownAHouse: formData.ownAHouse || undefined,
        ownACar: formData.ownACar || undefined,
        openToPets: formData.openToPets || undefined,
        languages: formData.languages.length > 0 ? formData.languages : undefined,
        hobbies: formData.hobbies.length > 0 ? formData.hobbies : undefined,
        interest: formData.interest.length > 0 ? formData.interest : undefined,
        foodICook: formData.foodICook || undefined,
        favMusic: formData.favMusic.length > 0 ? formData.favMusic : undefined,
        favRead: formData.favRead || undefined,
        dress: formData.dress.length > 0 ? formData.dress : undefined,
        sports: formData.sports.length > 0 ? formData.sports : undefined,
        books: formData.books.length > 0 ? formData.books : undefined,
        cuisine: formData.cuisine.length > 0 ? formData.cuisine : undefined,
        movies: formData.movies || undefined,
        favTVShow: formData.favTVShow || undefined,
        vacayDestination: formData.vacayDestination || undefined,
        section: 'lifestyle',
      }

      // Remove empty string fields (convert to undefined then remove)
      Object.keys(updatePayload).forEach((key) => {
        if (updatePayload[key] === '' || updatePayload[key] === undefined) {
          delete updatePayload[key]
        }
      })

      // Always include section
      updatePayload.section = 'lifestyle'

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
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Update your lifestyle information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-4">
            <SelectButton
              label="Dietary Habits"
              value={displayLabels.dietaryHabits}
              placeholder="Select Dietary Habits"
              onClick={() => setActivePicker('dietaryHabits')}
            />

            <SelectButton
              label="Drinking Habits"
              value={displayLabels.drinkingHabits}
              placeholder="Select Drinking Habits"
              onClick={() => setActivePicker('drinkingHabits')}
            />

            <SelectButton
              label="Smoking Habits"
              value={displayLabels.smokingHabits}
              placeholder="Select Smoking Habits"
              onClick={() => setActivePicker('smokingHabits')}
            />

            <SelectButton
              label="Own a House?"
              value={displayLabels.ownAHouse}
              placeholder="Select Own a House"
              onClick={() => setActivePicker('ownAHouse')}
            />

            <SelectButton
              label="Own A Car?"
              value={displayLabels.ownACar}
              placeholder="Select Own A Car"
              onClick={() => setActivePicker('ownACar')}
            />

            <SelectButton
              label="Open To Pets?"
              value={displayLabels.openToPets}
              placeholder="Select Open To Pets"
              onClick={() => setActivePicker('openToPets')}
            />

            <MultiSelectField
              label="Language Known"
              placeholder="Select languages"
              options={languagesOptions}
              selectedValues={formData.languages}
              onChange={(values) => setFormData((prev) => ({ ...prev, languages: values }))}
            />

            <MultiSelectField
              label="Hobbies"
              placeholder="Select hobbies"
              options={hobbiesOptions}
              selectedValues={formData.hobbies}
              onChange={(values) => setFormData((prev) => ({ ...prev, hobbies: values }))}
            />

            <MultiSelectField
              label="Interests"
              placeholder="Select interests"
              options={interestsOptions}
              selectedValues={formData.interest}
              onChange={(values) => setFormData((prev) => ({ ...prev, interest: values }))}
            />

            <TextInput
              label="Food I Cook"
              value={formData.foodICook}
              onChange={(e) => setFormData((prev) => ({ ...prev, foodICook: e.target.value }))}
              placeholder="Enter food you cook"
            />

            <MultiSelectField
              label="Favourite Music"
              placeholder="Select favourite music"
              options={musicOptions}
              selectedValues={formData.favMusic}
              onChange={(values) => setFormData((prev) => ({ ...prev, favMusic: values }))}
            />

            <TextInput
              label="Favourite Read"
              value={formData.favRead}
              onChange={(e) => setFormData((prev) => ({ ...prev, favRead: e.target.value }))}
              placeholder="Enter favourite read"
            />

            <MultiSelectField
              label="Dress Style"
              placeholder="Select dress style"
              options={dressOptions}
              selectedValues={formData.dress}
              onChange={(values) => setFormData((prev) => ({ ...prev, dress: values }))}
            />

            <MultiSelectField
              label="Sports"
              placeholder="Select sports"
              options={sportsOptions}
              selectedValues={formData.sports}
              onChange={(values) => setFormData((prev) => ({ ...prev, sports: values }))}
            />

            <MultiSelectField
              label="Favourite Books"
              placeholder="Select favourite books"
              options={booksOptions}
              selectedValues={formData.books}
              onChange={(values) => setFormData((prev) => ({ ...prev, books: values }))}
            />

            <MultiSelectField
              label="Favourite Cuisine"
              placeholder="Select favourite cuisine"
              options={cuisineOptions}
              selectedValues={formData.cuisine}
              onChange={(values) => setFormData((prev) => ({ ...prev, cuisine: values }))}
            />

            <TextInput
              label="Favourite Movies"
              value={formData.movies}
              onChange={(e) => setFormData((prev) => ({ ...prev, movies: e.target.value }))}
              placeholder="Enter favourite movies"
            />

            <TextInput
              label="Favourite TV Show"
              value={formData.favTVShow}
              onChange={(e) => setFormData((prev) => ({ ...prev, favTVShow: e.target.value }))}
              placeholder="Enter favourite TV show"
            />

            <TextInput
              label="Vacation Destination"
              value={formData.vacayDestination}
              onChange={(e) => setFormData((prev) => ({ ...prev, vacayDestination: e.target.value }))}
              placeholder="Enter vacation destination"
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

