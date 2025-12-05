import { useCallback, useRef, useState } from 'react'
import { useApiClient } from './useApiClient'
import type { LookupDictionary, LookupOption, LookupResponse } from '../types/api'

type LookupPayload =
  | LookupResponse
  | {
      lookupData?: LookupDictionary | LookupDictionary[]
    }
  | LookupDictionary
  | undefined

type GenericOptionResponse =
  | LookupOption[]
  | {
      data?: LookupOption[]
      lookupData?: LookupOption[]
      countryLookup?: LookupOption[]
      stateLookup?: LookupOption[]
      cityLookup?: LookupOption[]
      countries?: LookupOption[]
      states?: LookupOption[]
      cities?: LookupOption[]
    }
  | undefined

const normalizeOption = (option: LookupOption | string | number | undefined | null): LookupOption | null => {
  if (option === undefined || option === null) return null
  if (typeof option === 'string' || typeof option === 'number') {
    const stringValue = option.toString()
    return {
      label: stringValue,
      value: stringValue,
    }
  }

  const { label, value, name, id, _id } = option
  const resolvedLabel = label ?? name ?? value?.toString() ?? id?.toString() ?? _id?.toString()
  // Prioritize 'value' field over 'id'/'_id' for lookup matching
  // This is important because city/state lookups have both 'value' (code) and '_id' (MongoDB ID)
  const rawResolvedValue = value ?? id ?? _id ?? label ?? name
  const resolvedValue =
    typeof rawResolvedValue === 'string'
      ? rawResolvedValue
      : rawResolvedValue !== undefined && rawResolvedValue !== null
        ? rawResolvedValue.toString()
        : undefined
  if (!resolvedLabel || resolvedValue === undefined || resolvedValue === null) {
    return null
  }

  return {
    label: resolvedLabel,
    value: resolvedValue,
  }
}

const normalizeOptions = (payload: GenericOptionResponse): LookupOption[] => {
  if (!payload) return []
  if (Array.isArray(payload)) {
    // Special cases: state / city lookup come as [{ country_id, states: [...] }] or [{ state_id, cities: [...] }]
    const first = payload[0] as { states?: unknown; cities?: unknown } | undefined
    if (first?.states && Array.isArray(first.states)) {
      return (first.states as LookupOption[])
        .map((option) => normalizeOption(option))
        .filter((option): option is LookupOption => Boolean(option))
    }
    if (first?.cities && Array.isArray(first.cities)) {
      return (first.cities as LookupOption[])
        .map((option) => normalizeOption(option))
        .filter((option): option is LookupOption => Boolean(option))
    }

    return payload
      .map((option) => normalizeOption(option))
      .filter((option): option is LookupOption => Boolean(option))
  }

  const candidates = [
    payload.lookupData,
    payload.data,
    payload.countryLookup,
    payload.stateLookup,
    payload.cityLookup,
    payload.countries,
    payload.states,
    payload.cities,
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .map((option) => normalizeOption(option))
        .filter((option): option is LookupOption => Boolean(option))
    }
  }

  return []
}

const normalizeLookupPayload = (payload: LookupPayload): LookupDictionary => {
  if (!payload) return {}

  if ('lookupData' in (payload as LookupResponse)) {
    const lookupValue = (payload as LookupResponse).lookupData
    if (Array.isArray(lookupValue)) {
      return lookupValue[0] ?? {}
    }
    if (lookupValue) {
      return lookupValue
    }
  }

  if (Array.isArray((payload as { lookupData?: LookupDictionary[] }).lookupData)) {
    return (payload as { lookupData?: LookupDictionary[] }).lookupData?.[0] ?? {}
  }

  return payload as LookupDictionary
}

type UseLookupResult = {
  lookupData: LookupDictionary
  loading: boolean
  error: string | null
  fetchLookup: () => Promise<LookupDictionary>
  fetchCountries: () => Promise<LookupOption[]>
  fetchStates: (countryId: string) => Promise<LookupOption[]>
  fetchCities: (stateId: string) => Promise<LookupOption[]>
}

export const useLookup = (): UseLookupResult => {
  const { get } = useApiClient()
  const [lookupData, setLookupData] = useState<LookupDictionary>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lookupRef = useRef<LookupDictionary>({})

  const fetchLookup = useCallback(async () => {
    if (Object.keys(lookupRef.current).length > 0) {
      setLookupData((current) => (Object.keys(current).length ? current : lookupRef.current))
      return lookupRef.current
    }

    try {
      setLoading(true)
      setError(null)
      const response = await get<LookupPayload>('lookup')
      const normalized = normalizeLookupPayload(response)
      lookupRef.current = normalized
      setLookupData(normalized)
      return normalized
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load lookup data'
      setError(message)
      console.error('Lookup fetch failed:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [get])

  const fetchCountries = useCallback(async () => {
    const response = await get<GenericOptionResponse>('lookup/getCountryLookup')
    return normalizeOptions(response)
  }, [get])

  const fetchStates = useCallback(
    async (countryId: string) => {
      if (!countryId) return []
      const response = await get<GenericOptionResponse>(`lookup/getStateLookup/${countryId}`)
      return normalizeOptions(response)
    },
    [get],
  )

  const fetchCities = useCallback(
    async (stateId: string) => {
      if (!stateId) return []
      const response = await get<GenericOptionResponse>(`lookup/getCityLookup/${stateId}`)
      return normalizeOptions(response)
    },
    [get],
  )

  return {
    lookupData,
    loading,
    error,
    fetchLookup,
    fetchCountries,
    fetchStates,
    fetchCities,
  }
}
