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

  const compactLocation = useMemo(() => {
    if (!profile.location) return 'Location not available'
    return profile.location.split(',').slice(0, 3).join(', ')
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

  return (
    <article
      onClick={handleCardClick}
      className="group flex min-w-[280px] cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 md:flex-row"
    >
      <div className="relative w-full bg-slate-100 dark:bg-slate-900 md:w-1/2">
        <div className="flex h-64 items-center justify-center p-2 md:h-full">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="max-h-[360px] w-full object-contain"
              loading="lazy"
            />
          ) : (
            <PlaceholderAvatar gender={profile.gender} />
          )}
        </div>
        {profile.verified && (
          <div className="absolute right-3 top-3 rounded-full bg-emerald-500 p-1.5 shadow-md">
            <svg
              className="h-4 w-4 text-white"
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

      <div className="flex flex-1 flex-col gap-4 p-4 text-slate-600 dark:text-slate-300">
        <div className="space-y-1">
          
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{profile.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {profile.age} yrs • {profile.height}
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.income}</p>
          {profile.caste && <p className="text-sm text-slate-600 dark:text-slate-300">{profile.caste}</p>}
          <p className="text-xs text-slate-500 dark:text-slate-400">{compactLocation}</p>
        </div>

        <Button
          size="md"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-pink-500 py-3 font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:bg-pink-600"
          onClick={handleButtonClick}
        >
          <EyeIcon className="h-4 w-4" />
          {actionLabel}
        </Button>
      </div>
    </article>
  )
}