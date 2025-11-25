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

const PlaceholderAvatar = () => (
  <div className="flex h-full w-full items-center justify-center bg-slate-200">
    <svg
      className="h-12 w-12 text-slate-400"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
        clipRule="evenodd"
      />
    </svg>
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
      className="flex h-full min-w-[240px] cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="relative mb-4 flex h-56 w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900">
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt={profile.name}
            className="max-h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          <PlaceholderAvatar />
        )}
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

      <div className="flex flex-1 flex-col items-center space-y-1 text-slate-600 dark:text-slate-300">
        {/* <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          <span className="line-clamp-1">{profile.id}</span>
        </p> */}
        <p className="text-base font-semibold text-slate-900 dark:text-white">{profile.name}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {profile.age} yrs • {profile.height}
        </p>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.income}</p>
        {profile.caste && <p className="text-sm">{profile.caste}</p>}
        <p className="text-xs text-slate-500 dark:text-slate-400">{compactLocation}</p>
      </div>

      <Button
        size="md"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-pink-500 py-3 font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:bg-pink-600"
        onClick={handleButtonClick}
      >
        <EyeIcon className="h-4 w-4" />
        {actionLabel}
      </Button>
    </article>
  )
}