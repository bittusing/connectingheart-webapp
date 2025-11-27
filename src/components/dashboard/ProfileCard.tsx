import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { EyeIcon } from '@heroicons/react/24/outline'
import type { ProfileCardData } from '../../types/dashboard'
import { Button } from '../common/Button'

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
  <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-800">
    <img
      src={getPlaceholderImage(gender)}
      alt="Profile placeholder"
      className="h-full w-full object-cover"
      loading="lazy"
    />
  </div>
)

export const ProfileCard = ({ profile, actionLabel, onClick }: ProfileCardProps) => {
  const navigate = useNavigate()

  const locationParts = useMemo(() => {
    if (!profile.location) return []
    // Split location and filter out empty strings
    return profile.location.split(',').map((part) => part.trim()).filter(Boolean)
  }, [profile.location])

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

  const heartsIdDisplay = profile.heartsId ? `HEARTS-${profile.heartsId}` : profile.id

  return (
    <article
      onClick={handleCardClick}
      className="group flex h-auto min-h-[200px] w-full max-w-[500px] cursor-pointer flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all hover:shadow-xl sm:flex-row sm:h-[280px] dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="relative h-[250px] w-full flex-shrink-0 overflow-hidden bg-slate-100 sm:h-full sm:w-[200px] dark:bg-slate-900">
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt={profile.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <PlaceholderAvatar gender={profile.gender} />
        )}
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

      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 text-slate-600 dark:text-slate-300">
        <div className="space-y-2 text-left">
          <p className="text-base font-bold sm:text-lg text-slate-900 dark:text-white">{heartsIdDisplay}</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {profile.age} yrs • {profile.height}
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.income}</p>
          {profile.caste && (
            <p className="text-sm text-slate-600 dark:text-slate-400">{profile.caste}</p>
          )}
          {locationParts.length > 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locationParts.join(', ')}
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">Location not available</p>
          )}
        </div>

        <div className="mt-4 flex justify-end sm:mt-0">
          <Button
            size="md"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-pink-600 active:scale-95 sm:w-auto sm:px-5"
            onClick={handleButtonClick}
          >
            <EyeIcon className="h-4 w-4" />
            {actionLabel}
          </Button>
        </div>
      </div>
    </article>
  )
}