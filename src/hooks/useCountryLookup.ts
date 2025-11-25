import { useState, useEffect, useCallback } from 'react'
import { useApiClient } from './useApiClient'
import type { LookupOption } from '../types/api'

type CountryLookupResponse = {
  code: string
  status: string
  message?: string
  lookupData?: LookupOption[]
  countryLookup?: LookupOption[]
  data?: LookupOption[]
}

type UseCountryLookupResult = {
  countries: LookupOption[]
  loading: boolean
  error: string | null
  refetch: () => void
}

const extractCountries = (payload: CountryLookupResponse | LookupOption[]): LookupOption[] => {
  if (Array.isArray(payload)) {
    return payload
  }
  return (
    payload.lookupData ||
    payload.countryLookup ||
    payload.data ||
    []
  )
}

export const useCountryLookup = (): UseCountryLookupResult => {
  const { get } = useApiClient()
  const [countries, setCountries] = useState<LookupOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCountries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await get<CountryLookupResponse | LookupOption[]>('lookup/getCountryLookup')
      const parsed = extractCountries(response)
      setCountries(parsed)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load countries'
      setError(message)
      console.error('Country lookup failed:', err)
    } finally {
      setLoading(false)
    }
  }, [get])

  useEffect(() => {
    fetchCountries()
  }, [fetchCountries])

  return {
    countries,
    loading,
    error,
    refetch: fetchCountries,
  }
}

