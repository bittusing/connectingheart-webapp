import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EyeIcon } from '@heroicons/react/24/outline'
import type { ProfileCardData } from '../../types/dashboard'
import { Button } from '../common/Button'
import { getGenderPlaceholder } from '../../utils/imagePlaceholders'

type ProfileCardProps = {
  profile: ProfileCardData
  actionLabel: string
  onClick?: () => void
}

export const ProfileCard = ({ profile, actionLabel, onClick }: ProfileCardProps) => {
  const navigate = useNavigate()
  const [imageFailed, setImageFailed] = useState(false)
  const profileImageSrc =
    !profile.avatar || imageFailed ? getGenderPlaceholder(profile.gender) : profile.avatar ?? getGenderPlaceholder(profile.gender)

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
      className="group flex h-[180px] w-full min-w-[320px] max-w-[420px] cursor-pointer flex-shrink-0 flex-row overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all hover:shadow-xl sm:h-[220px] sm:min-w-[400px] sm:max-w-[500px] dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="relative h-full w-[120px] flex-shrink-0 overflow-hidden bg-slate-100 sm:w-[180px] dark:bg-slate-900">
        <img
          src={profileImageSrc}
          alt={profile.name}
          className="h-full w-full object-cover object-top transition-transform group-hover:scale-105"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
        {profile.verified && (
          <div className="absolute right-2 top-2 rounded-full bg-emerald-500 p-1 shadow-md">
            <svg
              className="h-3 w-3 text-white sm:h-3.5 sm:w-3.5"
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

      <div className="flex flex-1 flex-col justify-between p-3 text-slate-600 sm:p-4 dark:text-slate-300">
        <div className="space-y-1 text-left sm:space-y-1.5">
          <p className="text-sm font-bold text-slate-900 sm:text-base dark:text-white">{heartsIdDisplay}</p>
          <p className="text-sm font-bold text-slate-900 sm:text-base dark:text-white">
            {profile.age} yrs • {profile.height}
          </p>
          <p className="text-xs font-semibold text-slate-900 sm:text-sm dark:text-white">{profile.income}</p>
          {profile.caste && (
            <p className="text-sm font-bold text-slate-900 sm:text-base dark:text-white">{profile.caste}</p>
          )}
          {locationParts.length > 0 ? (
            <p className="text-sm font-bold text-slate-900 sm:text-base dark:text-white">
              {locationParts.join(', ')}
            </p>
          ) : (
            <p className="text-[10px] text-slate-500 sm:text-xs dark:text-slate-400">Location not available</p>
          )}
        </div>

        <div className="mt-2 flex justify-end sm:mt-0">
          <Button
            size="md"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:bg-pink-600 active:scale-95 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
            onClick={handleButtonClick}
          >
            <EyeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {actionLabel}
          </Button>
        </div>
      </div>
    </article>
  )
}