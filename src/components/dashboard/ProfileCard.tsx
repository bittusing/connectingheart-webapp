import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { EyeIcon } from '@heroicons/react/24/outline'
import type { ProfileCardData } from '../../types/dashboard'
import { Button } from '../common/Button'
import { useLookup } from '../../hooks/useLookup'

type ProfileCardProps = {
  profile: ProfileCardData
  actionLabel: string
  onClick?: () => void
}

const getPlaceholderImage = (gender?: string) => {
  const normalized = gender?.toLowerCase()
  if (normalized === 'male' || normalized === 'm') {
    return '/man-placeholder.png'
  }
  if (normalized === 'female' || normalized === 'f') {
    return '/female-placeholder.png'
  }
  return '/female-placeholder.png'
}

const PlaceholderAvatar = ({ gender }: { gender?: string }) => (
  <div className="flex h-full w-full items-center justify-center bg-slate-200">
    <img
      src={getPlaceholderImage(gender)}
      alt="Profile placeholder"
      className="h-full w-full object-contain"
      loading="lazy"
    />
  </div>
)

export const ProfileCard = ({ profile, actionLabel, onClick }: ProfileCardProps) => {
  const navigate = useNavigate()
  const { lookupData, fetchLookup } = useLookup()

  useEffect(() => {
    if (!lookupData.casts || lookupData.casts.length === 0) {
      void fetchLookup()
    }
  }, [lookupData.casts, fetchLookup])

  const compactLocation = useMemo(() => {
    if (!profile.location) return 'Location not available'
    return profile.location.split(',').slice(0, 3).join(', ')
  }, [profile.location])

  const displayCaste = useMemo(() => {
    if (!profile.caste) return ''
    const casteCode = String(profile.caste).trim()
    const casts = lookupData.casts ?? []
    const match = casts.find(
      (option) =>
        String(option.value).trim().toLowerCase() === casteCode.toLowerCase() ||
        option.label.trim().toLowerCase() === casteCode.toLowerCase(),
    )
    return match?.label ?? profile.caste
  }, [profile.caste, lookupData.casts])

  const handleCardClick = () => {
    navigate(`/dashboard/profile/${profile.id}`)
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onClick) {
      onClick()
    } else {
      handleCardClick()
    }
  }

  return (
    <article
      onClick={handleCardClick}
      className="group flex h-[320px] w-[300px] cursor-pointer flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 md:flex-row md:h-[280px] md:w-[420px]"
    >
      <div className="relative h-[160px] w-full bg-slate-100 dark:bg-slate-900 md:h-full md:w-[200px]">
        <div className="flex h-full w-full items-center justify-center p-2">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          ) : (
            <PlaceholderAvatar gender={profile.gender} />
          )}
        </div>
        {profile.verified && (
          <div className="absolute right-2 top-2 rounded-full bg-emerald-500 p-1 shadow-md">
            <svg
              className="h-3.5 w-3.5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-3 p-4 text-slate-600 dark:text-slate-300">
        <div className="space-y-1 text-center md:text-left">
          <p className="text-base font-semibold text-slate-900 dark:text-white">{profile.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {profile.age} yrs • {profile.height}
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.income}</p>
          {displayCaste && <p className="text-sm text-slate-600 dark:text-slate-300">{displayCaste}</p>}
          <p className="text-xs text-slate-500 dark:text-slate-400">{compactLocation}</p>
        </div>

        <Button
          size="md"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-pink-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:bg-pink-600"
          onClick={handleButtonClick}
        >
          <EyeIcon className="h-4 w-4" />
          {actionLabel}
        </Button>
      </div>
    </article>
  )
}