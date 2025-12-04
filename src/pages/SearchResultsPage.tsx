import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSearchProfiles } from '../hooks/useSearchProfiles'
import type { ProfileSearchPayload } from '../types/api'
import { ProfileActionCard } from '../components/dashboard/ProfileActionCard'
import { Button } from '../components/common/Button'
import { Pagination } from '../components/dashboard/Pagination'

const ITEMS_PER_PAGE = 9

const STORAGE_KEY = 'connectingheart-search-filters'

type LocationState = {
  filters: ProfileSearchPayload
}

export const SearchResultsPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)

  const filters = useMemo(() => {
    const state = location.state as LocationState | null
    if (state?.filters) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state.filters))
      return state.filters
    }
    const cached = sessionStorage.getItem(STORAGE_KEY)
    return cached ? (JSON.parse(cached) as ProfileSearchPayload) : null
  }, [location.state])

  const { profiles, loading, error } = useSearchProfiles(filters)

  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const totalProfiles = profiles.length
  const totalPages = Math.max(1, Math.ceil(totalProfiles / ITEMS_PER_PAGE))

  const paginatedProfiles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return profiles.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [profiles, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToSearch = () => {
    navigate('/dashboard/search')
  }

  if (!filters) {
    return (
      <section className="space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-white">
            Search Results
          </h1>
        </header>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No search filters found. Please start a new search.
          </p>
          <Button className="mt-4" onClick={handleBackToSearch}>
            Go to Search
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-widest text-slate-400">Connecting Hearts</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-white">
          Search Results
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          We matched your latest filters with our member base.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
          {filters.country?.length && <span>Country: {filters.country.length} selected</span>}
          {filters.religion?.length && <span>Religion: {filters.religion.length} selected</span>}
          {filters.motherTongue?.length && (
            <span>Mother Tongue: {filters.motherTongue.length} selected</span>
          )}
          {filters.maritalStatus?.length && (
            <span>Marital Status: {filters.maritalStatus.length} selected</span>
          )}
          {filters.age && (
            <span>
              Age: {filters.age.min ?? 'Any'} – {filters.age.max ?? 'Any'}
            </span>
          )}
          {filters.height && (
            <span>
              Height: {filters.height.min ?? 'Any'} – {filters.height.max ?? 'Any'}
            </span>
          )}
          {filters.income && (
            <span>
              Income: {filters.income.min ?? 'Any'} – {filters.income.max ?? 'Any'}
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="ghost" onClick={handleBackToSearch}>
            Modify Filters
          </Button>
          {totalProfiles > 0 && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Showing page {currentPage} of {totalPages} • {totalProfiles} profiles
            </span>
          )}
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent"></div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Searching profiles...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          <Button className="mt-4" onClick={handleBackToSearch}>
            Try another search
          </Button>
        </div>
      ) : totalProfiles === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">No profiles match your filters.</p>
          <Button className="mt-4" onClick={handleBackToSearch}>
            Adjust filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedProfiles.map((profile) => (
              <ProfileActionCard key={profile.id} profile={profile} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </section>
  )
}

