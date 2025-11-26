import { useNavigate } from 'react-router-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'
import type { ProfileCardData } from '../../types/dashboard'
import type { ProfileActionType } from '../../hooks/useProfileActions'

type SingleButtonConfig = {
  label: string
  icon?: React.ReactNode
  onClick: (profileId: string) => void
  actionType: ProfileActionType
}

type ProfileActionCardProps = {
  profile: ProfileCardData
  onSendInterest?: (profileId: string) => void
  onShortlist?: (profileId: string) => void
  onIgnore?: (profileId: string) => void
  singleButton?: SingleButtonConfig
  pendingActionType?: ProfileActionType | null
  pendingProfileId?: string | null
}

const actionButtons = [
  { label: 'Send interest', icon: '➤', key: 'send-interest' as ProfileActionType },
  { label: 'Shortlist', icon: '★', key: 'shortlist' as ProfileActionType },
  { label: 'Ignore', icon: '✕', key: 'ignore' as ProfileActionType },
]

export const ProfileActionCard = ({
  profile,
  onSendInterest,
  onShortlist,
  onIgnore,
  singleButton,
  pendingActionType,
  pendingProfileId,
}: ProfileActionCardProps) => {
  const navigate = useNavigate()

  const handleCardClick = () => {
    // Navigate to profile view page using profile id
    navigate(`/dashboard/profile/${profile.id}`)
  }

  const handleActionClick = (e: React.MouseEvent, actionKey: ProfileActionType) => {
    e.stopPropagation() // Prevent card click when clicking action buttons

    if (actionKey === 'send-interest' && onSendInterest) {
      onSendInterest(profile.id)
      return
    }

    if (actionKey === 'shortlist' && onShortlist) {
      onShortlist(profile.id)
      return
    }

    if (actionKey === 'ignore' && onIgnore) {
      onIgnore(profile.id)
      return
    }

    console.log(`Unhandled action: ${actionKey} for profile ${profile.id}`)
  }

  const handleSingleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (singleButton) {
      singleButton.onClick(profile.id)
    }
  }

  return (
    <article
      onClick={handleCardClick}
      className="cursor-pointer rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="relative h-64 w-full overflow-hidden rounded-t-3xl bg-slate-200 dark:bg-slate-700">
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt={profile.name}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              // Hide image on error, show placeholder
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-16 w-16 text-slate-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4">
          {/* <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            {profile.id}
          </p> */}
          <p className="mt-1 text-lg font-semibold text-white">{profile.name}</p>
          <p className="text-sm text-white/80">
            {profile.age} yrs · {profile.height} · {profile.income}
          </p>
          {profile.caste && <p className="text-xs text-white/70">{profile.caste}</p>}
          <p className="text-xs text-white/70">{profile.location}</p>
        </div>
      </div>
      {singleButton ? (
        <div className="border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleSingleButtonClick}
            disabled={
              pendingActionType === singleButton.actionType && pendingProfileId === profile.id
            }
            className="flex w-full items-center justify-center gap-2 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-300 dark:hover:bg-red-900/20"
          >
            {singleButton.icon || <XMarkIcon className="h-5 w-5" />}
            {pendingActionType === singleButton.actionType && pendingProfileId === profile.id
              ? 'Please wait...'
              : singleButton.label}
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-3 divide-x divide-slate-200 text-center text-xs uppercase tracking-widest dark:divide-slate-800">
        {actionButtons.map((action) => {
          const isPending =
            pendingActionType === action.key && pendingProfileId === profile.id

          return (
            <button
              key={action.label}
              onClick={(e) => handleActionClick(e, action.key)}
              disabled={
                (action.key === 'send-interest' && !onSendInterest) ||
                (action.key === 'shortlist' && !onShortlist) ||
                (action.key === 'ignore' && !onIgnore) ||
                isPending
              }
              className="flex flex-col items-center gap-1 py-3 text-slate-600 transition hover:bg-pink-50 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <span className="text-base">{action.icon}</span>
              {isPending ? 'Please wait...' : action.label}
            </button>
          )
        })}
      </div>
      )}
    </article>
  )
}

