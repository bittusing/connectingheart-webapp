import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { ProfileCard } from './ProfileCard'
import { useApiClient } from '../../hooks/useApiClient'
import type { DashboardSection } from '../../types/dashboard'
import type { ApiProfile, ApiProfileResponse } from '../../types/api'
import { transformApiProfiles } from '../../utils/profileTransform'

type SectionConfig = {
  id: string
  title: string
  endpoint: string
  actionLabel: string
  viewAllHref: string
  limit?: number
}

const sectionConfigs: SectionConfig[] = [
  {
    id: 'daily-recommendations',
    title: 'Daily Recommendation',
    endpoint: 'interest/getDailyRecommendations',
    actionLabel: 'View Profile',
    viewAllHref: '/dashboard/recommendations',
  },
  {
    id: 'profile-visitors',
    title: 'Profile Visitors',
    endpoint: 'dashboard/getProfileVisitors',
    actionLabel: 'View Visitor',
    viewAllHref: '/dashboard/visitors',
  },
  {
    id: 'all-profiles',
    title: 'All Profiles',
    endpoint: 'dashboard/getAllProfiles',
    actionLabel: 'View Profile',
    viewAllHref: '/dashboard/profiles',
  },
]

export const SectionRail = () => {
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const { get } = useApiClient()
  const [sections, setSections] = useState<DashboardSection[]>(
    sectionConfigs.map((config) => ({
      id: config.id,
      title: config.title,
      total: 0,
      actionLabel: config.actionLabel,
      cards: [],
      viewAllHref: config.viewAllHref,
    })),
  )
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string | null>>({})

  useEffect(() => {
    let isMounted = true

    const fetchSections = async () => {
      try {
        setLoading(true)
        const results = await Promise.all(
          sectionConfigs.map(async (config) => {
            try {
              const response = await get<ApiProfileResponse | ApiProfile[]>(config.endpoint)
              let profiles: ApiProfile[] = []
              if (Array.isArray(response)) {
                profiles = response
              } else if (response.status === 'success' && response.filteredProfiles) {
                profiles = response.filteredProfiles
              } else {
                throw new Error(response.message || 'Failed to fetch profiles')
              }

              const transformedProfiles = transformApiProfiles(profiles).slice(0, config.limit ?? 6)

              return {
                section: {
                  id: config.id,
                  title: config.title,
                  total: profiles.length,
                  actionLabel: config.actionLabel,
                  cards: transformedProfiles,
                  viewAllHref: config.viewAllHref,
                } as DashboardSection,
                error: null,
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to load'
              return {
                section: {
                  id: config.id,
                  title: config.title,
                  total: 0,
                  actionLabel: config.actionLabel,
                  cards: [],
                  viewAllHref: config.viewAllHref,
                } as DashboardSection,
                error: errorMessage,
              }
            }
          }),
        )

        if (!isMounted) return

        setSections(results.map((item) => item.section))
        const errorMap: Record<string, string | null> = {}
        results.forEach((item) => {
          errorMap[item.section.id] = item.error
        })
        setErrors(errorMap)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchSections()

    return () => {
      isMounted = false
    }
  }, [get])

  const scroll = (sectionId: string, direction: 'left' | 'right') => {
    const container = scrollRefs.current[sectionId]
    if (!container) return
    const scrollAmount = 320
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  if (loading && sections.every((section) => section.cards.length === 0)) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent" />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading matches for you...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
    {sections.map((section) => (
        <div key={section.id} className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">
                {section.total} {section.total === 1 ? 'result' : 'results'}
            </p>
              <h3 className="mt-1 font-display text-2xl font-semibold text-slate-900 dark:text-white">
              {section.title}
            </h3>
          </div>
            {section.viewAllHref ? (
              <Link
                to={section.viewAllHref}
                className="flex items-center gap-2 text-sm font-semibold text-pink-600 transition hover:text-pink-700"
              >
                View All
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            ) : (
              <button className="flex items-center gap-2 text-sm font-semibold text-pink-600 transition hover:text-pink-700">
                View All
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          {section.cards.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              {loading ? 'Loading...' : 'No profiles available at the moment.'}
              {!loading && errors[section.id] && (
                <p className="mt-2 text-xs text-red-500">Error: {errors[section.id]}</p>
              )}
        </div>
          ) : (
            <div className="relative">
              <div
                ref={(el) => {
                  scrollRefs.current[section.id] = el
                }}
                className="flex gap-5 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
          {section.cards.map((card) => (
                  <ProfileCard
              key={card.id}
                    profile={card}
                    actionLabel={section.actionLabel}
                  />
          ))}
        </div>
              {section.cards.length > 3 && (
                <>
                  <button
                    onClick={() => scroll(section.id, 'left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700"
                    aria-label="Scroll left"
                  >
                    <ChevronLeftIcon className="h-5 w-5 text-pink-600" />
                  </button>
                  <button
                    onClick={() => scroll(section.id, 'right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700"
                    aria-label="Scroll right"
                  >
                    <ChevronRightIcon className="h-5 w-5 text-pink-600" />
                  </button>
                </>
              )}
            </div>
          )}
      </div>
    ))}
  </div>
)
}

