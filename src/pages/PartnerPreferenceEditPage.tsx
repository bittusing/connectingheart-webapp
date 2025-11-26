import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { useApiClient } from '../hooks/useApiClient'
import { useLookup } from '../hooks/useLookup'
import type { LookupDictionary, LookupOption } from '../types/api'
import {
  ageOptions as defaultAgeOptions,
  heightOptions as defaultHeightOptions,
  incomeOptions as defaultIncomeOptions,
  motherTongueOptions as defaultMotherTongues,
  religionOptions as defaultReligionOptions,
  casteOptions as defaultCasteOptions,
  educationOptions as defaultEducationOptions,
  horoscopeOptions as defaultHoroscopeOptions,
  partnerManglikOptions as defaultManglikOptions,
} from '../data/registerOptions'
import { showToast } from '../utils/toast'

type PartnerPreferenceApiResponse = {
  code: string
  status: string
  message?: string
  data?: PartnerPreferenceRecord
}

type RangeRecord = {
  min?: number | null
  max?: number | null
}

type PartnerPreferenceRecord = {
  age?: RangeRecord | null
  height?: RangeRecord | null
  income?: RangeRecord | null
  minAge?: string | number
  maxAge?: string | number
  minHeight?: string | number
  maxHeight?: string | number
  minIncome?: string | number
  maxIncome?: string | number
  country?: unknown
  countries?: unknown
  residentialStatus?: unknown
  occupation?: unknown
  religion?: unknown
  religions?: unknown
  maritalStatus?: unknown
  maritalStatuses?: unknown
  motherTongue?: unknown
  caste?: unknown
  casts?: unknown
  education?: unknown
  educations?: unknown
  horoscope?: unknown
  horoscopes?: unknown
  manglik?: unknown
}

type RangePayload = {
  min?: number
  max?: number
}

type PartnerPreferencePayload = {
  age?: RangePayload
  height?: RangePayload
  income?: RangePayload
  country?: string[]
  residentialStatus?: string[]
  occupation?: string[]
  religion?: string[]
  maritalStatus?: string[]
  motherTongue?: string[]
  caste?: string[]
  education?: string[]
  horoscope?: string[]
  manglik?: string[]
}

type PreferenceFormState = {
  minAge: string
  maxAge: string
  minHeight: string
  maxHeight: string
  minIncome: string
  maxIncome: string
  countries: string[]
  residentialStatuses: string[]
  occupations: string[]
  religions: string[]
  maritalStatuses: string[]
  motherTongues: string[]
  castes: string[]
  educations: string[]
  horoscopes: string[]
  manglik: string[]
}

type MultiValueKey = keyof Pick<
  PreferenceFormState,
  | 'countries'
  | 'residentialStatuses'
  | 'occupations'
  | 'religions'
  | 'maritalStatuses'
  | 'motherTongues'
  | 'castes'
  | 'educations'
  | 'horoscopes'
  | 'manglik'
>

const defaultFormState: PreferenceFormState = {
  minAge: '',
  maxAge: '',
  minHeight: '',
  maxHeight: '',
  minIncome: '',
  maxIncome: '',
  countries: [],
  residentialStatuses: [],
  occupations: [],
  religions: [],
  maritalStatuses: [],
  motherTongues: [],
  castes: [],
  educations: [],
  horoscopes: [],
  manglik: [],
}

const MARITAL_FALLBACK = ['Never married', 'Divorced', 'Widowed', 'Annulled', 'Pending divorce']
const RESIDENTIAL_FALLBACK = ['Citizen', 'Permanent Resident', 'Work Visa', 'Student Visa']

export const PartnerPreferenceEditPage = () => {
  const navigate = useNavigate()
  const api = useApiClient()
  const { lookupData, fetchLookup, fetchCountries } = useLookup()

  const [formState, setFormState] = useState<PreferenceFormState>(defaultFormState)
  const [countryOptions, setCountryOptions] = useState<LookupOption[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setPageLoading(true)
      try {
        await fetchLookup().catch((error) => {
          console.error('Failed to load lookup data', error)
          showToast('Unable to load latest preference options. Using defaults.', 'error')
        })

        const countries = await fetchCountries().catch((error) => {
          console.error('Failed to load country lookup', error)
          showToast('Unable to load countries. Please try again later.', 'error')
          return [] as LookupOption[]
        })

        if (isMounted) {
          setCountryOptions(countries)
        }

        try {
          const response = await api.get<PartnerPreferenceApiResponse>('preference')
          if (!isMounted) return
          if (response.status === 'success' && response.data) {
            const record = response.data
            setFormState((prev) => ({
              ...prev,
              ...hydrateForm(record),
            }))
          }
        } catch (error) {
          console.error('Failed to fetch saved partner preferences', error)
        }
      } finally {
        if (isMounted) {
          setPageLoading(false)
        }
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [])

  const optionSets = useMemo(() => buildOptionSets(lookupData), [lookupData])

  const handleMultiChange = (key: MultiValueKey, values: string[]) => {
    setFormState((prev) => ({
      ...prev,
      [key]: dedupe(values),
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      const payload = buildPayload(formState)
      if (Object.keys(payload).length === 0) {
        showToast('Please select at least one preference before updating.', 'error')
        setSubmitting(false)
        return
      }

      const response = await api.patch<PartnerPreferencePayload, PartnerPreferenceApiResponse>(
        'preference',
        payload,
      )

      if (response.status === 'success' || response.code === 'CH200') {
        showToast('Partner preferences updated successfully.', 'success')
      } else {
        showToast(response.message || 'Unable to update preferences right now.', 'error')
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message.replace('API ', '') : 'Failed to update partner preferences'
      showToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (pageLoading) {
    return (
      <section className="section-shell pt-10 pb-12 sm:pt-12 lg:py-24">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500">Loading partner preferences...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="section-shell pt-10 pb-16 sm:pt-12 lg:py-24">
      <div className="space-y-6">
        <header className="rounded-3xl border border-pink-100 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-pink-400">Connecting Hearts</p>
              <h1 className="font-display text-2xl font-semibold text-slate-900">Partner Preferences</h1>
              <p className="text-sm text-slate-500">Update your ideal partner criteria anytime.</p>
            </div>
            <span className="rounded-full bg-pink-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-pink-600">
              Preferences saved
            </span>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <RangeGroup
            label="Age"
            minLabel="Min Age"
            maxLabel="Max Age"
            minValue={formState.minAge}
            maxValue={formState.maxAge}
            options={optionSets.age}
            onMinChange={(value) => setFormState((prev) => ({ ...prev, minAge: value }))}
            onMaxChange={(value) => setFormState((prev) => ({ ...prev, maxAge: value }))}
          />

          <RangeGroup
            label="Height"
            minLabel="Min Height"
            maxLabel="Max Height"
            minValue={formState.minHeight}
            maxValue={formState.maxHeight}
            options={optionSets.height}
            onMinChange={(value) => setFormState((prev) => ({ ...prev, minHeight: value }))}
            onMaxChange={(value) => setFormState((prev) => ({ ...prev, maxHeight: value }))}
          />

          <RangeGroup
            label="Income"
            minLabel="Min Income"
            maxLabel="Max Income"
            minValue={formState.minIncome}
            maxValue={formState.maxIncome}
            options={optionSets.income}
            onMinChange={(value) => setFormState((prev) => ({ ...prev, minIncome: value }))}
            onMaxChange={(value) => setFormState((prev) => ({ ...prev, maxIncome: value }))}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <MultiSelectField
              label="Country"
              placeholder="Select country"
              options={countryOptions}
              selectedValues={formState.countries}
              onChange={(values) => handleMultiChange('countries', values)}
            />
            <MultiSelectField
              label="Residential Status"
              placeholder="Select residential status"
              options={optionSets.residential}
              selectedValues={formState.residentialStatuses}
              onChange={(values) => handleMultiChange('residentialStatuses', values)}
            />
            <MultiSelectField
              label="Occupation"
              placeholder="Select occupation"
              options={optionSets.occupation}
              selectedValues={formState.occupations}
              onChange={(values) => handleMultiChange('occupations', values)}
            />
            <MultiSelectField
              label="Mother Tongue"
              placeholder="Select mother tongue"
              options={optionSets.motherTongue}
              selectedValues={formState.motherTongues}
              onChange={(values) => handleMultiChange('motherTongues', values)}
            />
          </div>

          <CheckboxGroup
            label="Religion"
            options={optionSets.religion}
            selectedValues={formState.religions}
            onToggle={(value) => handleToggle('religions', value)}
          />

          <CheckboxGroup
            label="Marital Status"
            options={optionSets.maritalStatus}
            selectedValues={formState.maritalStatuses}
            onToggle={(value) => handleToggle('maritalStatuses', value)}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <MultiSelectField
              label="Caste"
              placeholder="Select caste"
              options={optionSets.caste}
              selectedValues={formState.castes}
              onChange={(values) => handleMultiChange('castes', values)}
            />
            <MultiSelectField
              label="Education"
              placeholder="Select education"
              options={optionSets.education}
              selectedValues={formState.educations}
              onChange={(values) => handleMultiChange('educations', values)}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <MultiSelectField
              label="Horoscope"
              placeholder="Select horoscope"
              options={optionSets.horoscope}
              selectedValues={formState.horoscopes}
              onChange={(values) => handleMultiChange('horoscopes', values)}
            />
            <CheckboxGroup
              label="Manglik"
              options={optionSets.manglik}
              selectedValues={formState.manglik}
              onToggle={(value) => handleToggle('manglik', value)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? 'Saving...' : 'Update'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  )

  function handleToggle(key: MultiValueKey, value: string) {
    setFormState((prev) => {
      const nextValues = prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value]
      return {
        ...prev,
        [key]: nextValues,
      }
    })
  }
}

const RangeGroup = ({
  label,
  minLabel,
  maxLabel,
  minValue,
  maxValue,
  options,
  onMinChange,
  onMaxChange,
}: {
  label: string
  minLabel: string
  maxLabel: string
  minValue: string
  maxValue: string
  options: LookupOption[]
  onMinChange: (value: string) => void
  onMaxChange: (value: string) => void
}) => (
  <div className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50/50 p-4 shadow-inner shadow-white">
    <p className="text-sm font-semibold text-slate-900">{label}</p>
    <div className="grid gap-4 md:grid-cols-2">
      <SelectInput
        label={minLabel}
        value={minValue}
        placeholder={`Select ${minLabel.toLowerCase()}`}
        options={options}
        onChange={onMinChange}
      />
      <SelectInput
        label={maxLabel}
        value={maxValue}
        placeholder={`Select ${maxLabel.toLowerCase()}`}
        options={options}
        onChange={onMaxChange}
      />
    </div>
  </div>
)

const SelectInput = ({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  options: LookupOption[]
  onChange: (value: string) => void
}) => (
  <label className="space-y-1">
    <span className="text-sm font-medium text-slate-600">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-500"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
)

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

  const availableOptions = options.filter((option) => !selectedValues.includes(option.value))
  const filteredOptions = availableOptions.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase()),
  )

  const handleRemove = (value: string) => {
    onChange(selectedValues.filter((item) => item !== value))
  }

  const handleAdd = (value: string) => {
    if (!value) return
    onChange([...selectedValues, value])
    setIsOpen(false)
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <div className="relative rounded-2xl border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap gap-2">
          {selectedValues.map((value) => {
            const option = options.find((item) => item.value === value)
            const displayLabel = option?.label ?? value
            return (
              <span
                key={`${label}-${value}`}
                className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1 text-sm font-medium text-pink-600"
              >
                {displayLabel}
                <button
                  type="button"
                  onClick={() => handleRemove(value)}
                  className="text-base leading-none text-pink-500"
                  aria-label={`Remove ${displayLabel}`}
                >
                  ×
                </button>
              </span>
            )
          })}
          <button
            type="button"
            className="min-w-[160px] flex-1 rounded-full border border-dashed border-slate-300 px-3 py-1 text-left text-sm text-slate-500 hover:border-pink-400 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-500"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {availableOptions.length ? placeholder : 'No options available'}
          </button>
        </div>
        {isOpen && availableOptions.length > 0 && (
          <div className="absolute left-3 right-3 top-full z-20 mt-2 max-h-60 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-lg">
            <div className="border-b border-slate-100 bg-slate-50/80 px-3 py-2">
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500"
                placeholder="Search..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
              {filteredOptions.length === 0 && (
                <div className="px-3 py-2 text-xs text-slate-400">No matches found</div>
              )}
              {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-slate-700 hover:bg-pink-50"
                onClick={() => handleAdd(option.value)}
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

const CheckboxGroup = ({
  label,
  options,
  selectedValues,
  onToggle,
}: {
  label: string
  options: LookupOption[]
  selectedValues: string[]
  onToggle: (value: string) => void
}) => (
  <div className="space-y-2">
    <p className="text-sm font-medium text-slate-600">{label}</p>
    <div className="flex flex-wrap gap-4">
      {options.map((option) => (
        <label key={`${label}-${option.value}`} className="inline-flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500"
            checked={selectedValues.includes(option.value)}
            onChange={() => onToggle(option.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
  </div>
)

const buildOptionSets = (lookupData: LookupDictionary) => {
  const convert = (items?: LookupOption[], fallback: string[] = []): LookupOption[] => {
    if (items && items.length) {
      return items.map((item) => {
        const normalizedValue =
          typeof item.value === 'string'
            ? item.value
            : item.value !== undefined && item.value !== null
              ? String(item.value)
              : item.label
        return {
          label: item.label,
          value: normalizedValue ?? item.label,
        }
      })
    }
    return fallback.map((label) => ({ label, value: label }))
  }

  return {
    age: convert(lookupData.age, defaultAgeOptions),
    height: convert(lookupData.height, defaultHeightOptions),
    income: convert(lookupData.income, defaultIncomeOptions),
    residential: convert(lookupData.residentialStatus, RESIDENTIAL_FALLBACK),
    occupation: convert(lookupData.occupation, []),
    religion: convert(lookupData.religion, defaultReligionOptions),
    maritalStatus: convert(lookupData.maritalStatus, MARITAL_FALLBACK),
    motherTongue: convert(lookupData.motherTongue, defaultMotherTongues),
    caste: convert(lookupData.casts, defaultCasteOptions),
    education: convert(lookupData.highestEducation, defaultEducationOptions),
    horoscope: convert(lookupData.horoscopes, defaultHoroscopeOptions),
    manglik: convert(lookupData.manglik, defaultManglikOptions),
  }
}

const hydrateForm = (data: PartnerPreferenceRecord): Partial<PreferenceFormState> => ({
  minAge: rangeValueToString(data.age?.min ?? data.minAge),
  maxAge: rangeValueToString(data.age?.max ?? data.maxAge),
  minHeight: rangeValueToString(data.height?.min ?? data.minHeight),
  maxHeight: rangeValueToString(data.height?.max ?? data.maxHeight),
  minIncome: rangeValueToString(data.income?.min ?? data.minIncome),
  maxIncome: rangeValueToString(data.income?.max ?? data.maxIncome),
  countries: normalizeMultiValue(data.countries ?? data.country),
  residentialStatuses: normalizeMultiValue(data.residentialStatus),
  occupations: normalizeMultiValue(data.occupation),
  religions: normalizeMultiValue(data.religions ?? data.religion),
  maritalStatuses: normalizeMultiValue(data.maritalStatuses ?? data.maritalStatus),
  motherTongues: normalizeMultiValue(data.motherTongue),
  castes: normalizeMultiValue(data.caste ?? data.casts),
  educations: normalizeMultiValue(data.education ?? data.educations),
  horoscopes: normalizeMultiValue(data.horoscope ?? data.horoscopes),
  manglik: normalizeMultiValue(data.manglik),
})

const rangeValueToString = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'object' && value && 'value' in value) {
    const optionValue = (value as { value?: string | number }).value
    return optionValue !== undefined && optionValue !== null ? optionValue.toString() : ''
  }
  return ''
}

const normalizeMultiValue = (value: unknown): string[] => {
  if (!value) return []
  if (Array.isArray(value)) {
    return dedupe(
      value
        .map((entry) => {
          if (!entry && entry !== 0) return null
          if (typeof entry === 'string' || typeof entry === 'number') return entry.toString()
          if (typeof entry === 'object' && entry) {
            const lookupEntry = entry as { value?: string | number; label?: string }
            return lookupEntry.value?.toString() ?? lookupEntry.label ?? null
          }
          return null
        })
        .filter((item): item is string => Boolean(item)),
    )
  }

  if (typeof value === 'string') {
    return dedupe(
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    )
  }

  if (typeof value === 'number') {
    return [value.toString()]
  }

  return []
}

const dedupe = (values: string[]): string[] => {
  return Array.from(new Set(values.filter(Boolean)))
}

const buildPayload = (state: PreferenceFormState): PartnerPreferencePayload => {
  const payload: PartnerPreferencePayload = {
    age: buildRangePayload(state.minAge, state.maxAge),
    height: buildRangePayload(state.minHeight, state.maxHeight),
    income: buildRangePayload(state.minIncome, state.maxIncome),
    country: state.countries,
    residentialStatus: state.residentialStatuses,
    occupation: state.occupations,
    religion: state.religions,
    maritalStatus: state.maritalStatuses,
    motherTongue: state.motherTongues,
    caste: state.castes,
    education: state.educations,
    horoscope: state.horoscopes,
    manglik: state.manglik,
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0
      }
      if (value && typeof value === 'object') {
        return Object.keys(value).length > 0
      }
      return value !== undefined && value !== ''
    }),
  ) as PartnerPreferencePayload
}

const buildRangePayload = (minValue: string, maxValue: string): RangePayload | undefined => {
  const min = toNumeric(minValue)
  const max = toNumeric(maxValue)
  if (min === undefined && max === undefined) return undefined
  const range: RangePayload = {}
  if (min !== undefined) range.min = min
  if (max !== undefined) range.max = max
  return range
}

const toNumeric = (value: string): number | undefined => {
  if (!value) return undefined
  const numeric = Number(value)
  return Number.isNaN(numeric) ? undefined : numeric
}

