import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline'
import { Button } from '../components/common/Button'
import { useLookupOptions } from '../hooks/useLookupOptions'
import { useCountryLookup } from '../hooks/useCountryLookup'
import type { LookupOption, ProfileSearchPayload } from '../types/api'

type SelectFieldProps = {
  label: string
  value: string
  placeholder: string
  options: LookupOption[]
  disabled?: boolean
  onChange: (value: string) => void
}

const SelectField = ({
  label,
  value,
  placeholder,
  options,
  disabled,
  onChange,
}: SelectFieldProps) => (
  <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
    {label}
    <select
      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={`${label}-${option.value}`} value={String(option.value)}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
)

type MultiSelectFieldProps = {
  label: string
  placeholder: string
  values: string[]
  options: LookupOption[]
  disabled?: boolean
  onChange: (nextValues: string[]) => void
}

const MultiSelectField = ({
  label,
  placeholder,
  values,
  options,
  disabled,
  onChange,
}: MultiSelectFieldProps) => {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (disabled) {
      setOpen(false)
      setSearchTerm('')
    }
  }, [disabled])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value))
    } else {
      onChange([...values, value])
    }
  }

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options
    const lower = searchTerm.toLowerCase()
    return options.filter((option) => option.label.toLowerCase().includes(lower))
  }, [options, searchTerm])

  const selectedOptions = options.filter((option) => values.includes(String(option.value)))

  const displayText =
    selectedOptions.length === 0
      ? placeholder
      : selectedOptions
          .slice(0, 2)
          .map((option) => option.label)
          .join(', ') + (selectedOptions.length > 2 ? ` +${selectedOptions.length - 2}` : '')

  return (
    <div ref={containerRef} className="space-y-2">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-900 transition hover:border-pink-300 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      >
        <span className={values.length === 0 ? 'text-slate-400 dark:text-slate-500' : ''}>
          {displayText}
        </span>
        <ChevronDownIcon className="h-4 w-4 text-slate-400" />
      </button>
      {open && !disabled && (
        <div className="z-20 mt-2 max-h-64 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-200 p-2 dark:border-slate-700">
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500/50 dark:border-slate-600 dark:bg-slate-900"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-2">
            {filteredOptions.length === 0 && (
              <p className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500">No matches</p>
            )}
            {filteredOptions.map((option) => {
              const value = String(option.value)
              const isSelected = values.includes(value)
              return (
                <label
                  key={`${label}-${value}`}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700/50"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
                    checked={isSelected}
                    onChange={() => toggleValue(value)}
                  />
                  <span className="flex-1">{option.label}</span>
                  {isSelected && <CheckIcon className="h-4 w-4 text-pink-500" />}
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const initialMultiFilters = {
  country: [] as string[],
  religion: [] as string[],
  motherTongue: [] as string[],
  maritalStatus: [] as string[],
}

type RangeState = {
  min: string
  max: string
}

const initialRangeFilters: Record<'age' | 'height' | 'income', RangeState> = {
  age: { min: '', max: '' },
  height: { min: '', max: '' },
  income: { min: '', max: '' },
}

export const SearchPage = () => {
  const navigate = useNavigate()
  const [profileSuffix, setProfileSuffix] = useState('')
  const [multiFilters, setMultiFilters] = useState(initialMultiFilters)
  const [rangeFilters, setRangeFilters] = useState(initialRangeFilters)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [advancedError, setAdvancedError] = useState<string | null>(null)
  const { options, loading } = useLookupOptions()
  const { countries, loading: countryLoading } = useCountryLookup()

  const getOptions = useMemo(
    () => (key: string, fallbackKeys: string[] = []): LookupOption[] => {
      if (!options) return []
      if (options[key]) return options[key]
      for (const fallback of fallbackKeys) {
        if (options[fallback]) return options[fallback]
      }
      return []
    },
    [options],
  )

  const handleProfileSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanSuffix = profileSuffix.replace(/[^0-9]/g, '')
    if (!cleanSuffix) {
      setProfileError('Please enter a valid HEARTS ID number.')
      return
    }
    setProfileError(null)
    setAdvancedError(null)
    const payload: ProfileSearchPayload = {
      profileId: `HEARTS-${cleanSuffix}`,
    }
    navigate('/dashboard/search/results', { state: { filters: payload } })
  }

  const handleAdvancedSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload: ProfileSearchPayload = {}

    const multiFilterKeys = Object.keys(multiFilters) as (keyof typeof multiFilters)[]
    multiFilterKeys.forEach((key) => {
      if (multiFilters[key].length > 0) {
        payload[key] = [...multiFilters[key]]
      }
    })

    const buildRangePayload = (range: RangeState) => {
      const min = range.min ? Number(range.min) : undefined
      const max = range.max ? Number(range.max) : undefined
      return min !== undefined || max !== undefined ? { min, max } : undefined
    }

    const ageRange = buildRangePayload(rangeFilters.age)
    const heightRange = buildRangePayload(rangeFilters.height)
    const incomeRange = buildRangePayload(rangeFilters.income)

    if (ageRange) payload.age = ageRange
    if (heightRange) payload.height = heightRange
    if (incomeRange) payload.income = incomeRange

    if (!Object.keys(payload).length) {
      setAdvancedError('Select at least one filter before searching.')
      return
    }

    setAdvancedError(null)
    setProfileError(null)
    navigate('/dashboard/search/results', { state: { filters: payload } })
  }

  const handleClear = () => {
    setMultiFilters(initialMultiFilters)
    setRangeFilters(initialRangeFilters)
    setAdvancedError(null)
  }

  const updateRange = (key: keyof typeof rangeFilters, field: keyof RangeState, value: string) => {
    setRangeFilters((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }))
  }

  const countryOptions = countries
  const religionOptions = getOptions('religion')
  const motherTongueOptions = getOptions('motherTongue')
  const maritalStatusOptions = getOptions('maritalStatus')
  const ageOptions = getOptions('age')
  const heightOptions = getOptions('height')
  const incomeOptions = getOptions('income')
  const isLookupLoading = loading || countryLoading

  return (
    <section className="space-y-8">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-white">
          Search Profiles
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Search by Hearts ID or use advanced filters to find the right match.
        </p>
      </header>

      <form
        onSubmit={handleProfileSearch}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Search By Profile ID</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Enter a HEARTS ID to jump directly to a profile.
        </p>
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Profile ID</p>
            <div className="flex overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="bg-slate-100 px-4 py-3 text-sm font-semibold tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                HEARTS-
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                className="flex-1 border-0 px-4 py-3 text-sm text-slate-900 focus:outline-none dark:bg-slate-900 dark:text-white"
                placeholder="123456"
                value={profileSuffix}
                onChange={(event) => setProfileSuffix(event.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
            {profileError && <p className="text-xs text-red-500">{profileError}</p>}
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Search
            </Button>
          </div>
        </div>
      </form>

      <form
        onSubmit={handleAdvancedSearch}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Advanced Search</h2>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Combine multiple filters to narrow down your results.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <MultiSelectField
            label="Country"
            placeholder="Select country"
            values={multiFilters.country}
            options={countryOptions}
            disabled={isLookupLoading}
            onChange={(values) => setMultiFilters((prev) => ({ ...prev, country: values }))}
          />
          <MultiSelectField
            label="Religion"
            placeholder="Select religion"
            values={multiFilters.religion}
            options={religionOptions}
            disabled={isLookupLoading}
            onChange={(values) => setMultiFilters((prev) => ({ ...prev, religion: values }))}
          />
          <MultiSelectField
            label="Mother Tongue"
            placeholder="Select mother tongue"
            values={multiFilters.motherTongue}
            options={motherTongueOptions}
            disabled={isLookupLoading}
            onChange={(values) => setMultiFilters((prev) => ({ ...prev, motherTongue: values }))}
          />
          <MultiSelectField
            label="Marital Status"
            placeholder="Select marital status"
            values={multiFilters.maritalStatus}
            options={maritalStatusOptions}
            disabled={isLookupLoading}
            onChange={(values) => setMultiFilters((prev) => ({ ...prev, maritalStatus: values }))}
          />
          <SelectField
            label="Min Age"
            value={rangeFilters.age.min}
            placeholder="Min age"
            options={ageOptions}
            disabled={isLookupLoading}
            onChange={(value) => updateRange('age', 'min', value)}
          />
          <SelectField
            label="Max Age"
            value={rangeFilters.age.max}
            placeholder="Max age"
            options={ageOptions}
            disabled={isLookupLoading}
            onChange={(value) => updateRange('age', 'max', value)}
          />
          <SelectField
            label="Min Height"
            value={rangeFilters.height.min}
            placeholder="Min height"
            options={heightOptions}
            disabled={isLookupLoading}
            onChange={(value) => updateRange('height', 'min', value)}
          />
          <SelectField
            label="Max Height"
            value={rangeFilters.height.max}
            placeholder="Max height"
            options={heightOptions}
            disabled={isLookupLoading}
            onChange={(value) => updateRange('height', 'max', value)}
          />
          <SelectField
            label="Min Income"
            value={rangeFilters.income.min}
            placeholder="Min income"
            options={incomeOptions}
            disabled={isLookupLoading}
            onChange={(value) => updateRange('income', 'min', value)}
          />
          <SelectField
            label="Max Income"
            value={rangeFilters.income.max}
            placeholder="Max income"
            options={incomeOptions}
            disabled={isLookupLoading}
            onChange={(value) => updateRange('income', 'max', value)}
          />
        </div>

        {advancedError && <p className="mt-4 text-sm text-red-500">{advancedError}</p>}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={handleClear}>
            Clear All
          </Button>
          <Button type="submit">Search Profiles</Button>
        </div>
      </form>
    </section>
  )
}