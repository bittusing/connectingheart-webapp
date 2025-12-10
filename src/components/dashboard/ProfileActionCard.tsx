import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  XMarkIcon,
  PaperAirplaneIcon,
  StarIcon,
  CheckIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline'
import type { ProfileCardData } from '../../types/dashboard'
import type { ProfileActionType } from '../../hooks/useProfileActions'
import { getGenderPlaceholder } from '../../utils/imagePlaceholders'

type SingleButtonConfig = {
  label: string
  icon?: React.ReactNode
  onClick: (profileId: string) => void
  actionType: ProfileActionType
}

type DualButtonConfig = {
  onAccept: (profileId: string) => void
  onDecline: (profileId: string) => void
  acceptLabel?: string
  declineLabel?: string
  acceptIcon?: React.ReactNode
  declineIcon?: React.ReactNode
}

type ProfileActionCardProps = {
  profile: ProfileCardData
  onSendInterest?: (profileId: string) => void
  onShortlist?: (profileId: string) => void
  onIgnore?: (profileId: string) => void
  singleButton?: SingleButtonConfig
  dualButton?: DualButtonConfig
  hideButtons?: boolean
  pendingActionType?: ProfileActionType | null
  pendingProfileId?: string | null
}

const actionButtons = [
  {
    label: 'Send interest',
    icon: PaperAirplaneIcon,
    key: 'send-interest' as ProfileActionType,
  },
  { label: 'Shortlist', icon: StarIcon, key: 'shortlist' as ProfileActionType },
  { label: 'Ignore', icon: XMarkIcon, key: 'ignore' as ProfileActionType },
]

export const ProfileActionCard = ({
  profile,
  onSendInterest,
  onShortlist,
  onIgnore,
  singleButton,
  dualButton,
  hideButtons,
  pendingActionType,
  pendingProfileId,
}: ProfileActionCardProps) => {
  const navigate = useNavigate()
  const [imageFailed, setImageFailed] = useState(false)
  const cardImageSrc =
    !profile.avatar || imageFailed ? getGenderPlaceholder(profile.gender) : profile.avatar ?? getGenderPlaceholder(profile.gender)

  const handleCardClick = () => {
    // Navigate to profile view page using profile id
    // Check if we're on acceptance page, interestsent page, or theydeclined page by checking current pathname
    const isFromAcceptance = window.location.pathname.includes('/acceptance')
    const isFromInterestSent = window.location.pathname.includes('/interestsent')
    const isFromTheyDeclined = window.location.pathname.includes('/theydeclined')
    navigate(`/dashboard/profile/${profile.id}`, { 
      state: isFromAcceptance 
        ? { from: 'acceptance' } 
        : isFromInterestSent 
        ? { from: 'interestsent' } 
        : isFromTheyDeclined
        ? { from: 'theydeclined' }
        : undefined 
    })
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

  const handleAcceptClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (dualButton) {
      dualButton.onAccept(profile.id)
    }
  }

  const handleDeclineClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (dualButton) {
      dualButton.onDecline(profile.id)
    }
  }

  return (
    <article
      onClick={handleCardClick}
      className="group w-full cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-200 dark:bg-slate-700 sm:aspect-[3/4]">
        <img
          src={cardImageSrc}
          alt={profile.name}
          className="h-full w-full object-cover object-top transition-transform group-hover:scale-105"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 pb-6">
          <p className="text-xs font-semibold text-white/90">
            {profile.heartsId ? `HEARTS-${profile.heartsId}` : profile.id}
          </p>
          <p className="mt-0.5 text-sm font-medium text-white">
            {profile.age} yrs | {profile.height} | {profile.income}
          </p>
        </div>
      </div>
      {hideButtons ? null : dualButton ? (
        <div className="flex divide-x divide-slate-700 rounded-b-3xl bg-slate-800 dark:bg-slate-800">
          <button
            onClick={handleDeclineClick}
            disabled={pendingActionType === 'decline-interest' && pendingProfileId === profile.id}
            className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {dualButton.declineIcon || (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-600">
                <XMarkIcon className="h-6 w-6 text-white" />
              </div>
            )}
            <span>
              {pendingActionType === 'decline-interest' && pendingProfileId === profile.id
                ? 'Please wait...'
                : dualButton.declineLabel || 'Decline'}
            </span>
          </button>
          <button
            onClick={handleAcceptClick}
            disabled={pendingActionType === 'accept-interest' && pendingProfileId === profile.id}
            className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {dualButton.acceptIcon || (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                <CheckIcon className="h-6 w-6 text-white" />
              </div>
            )}
            <span>
              {pendingActionType === 'accept-interest' && pendingProfileId === profile.id
                ? 'Please wait...'
                : dualButton.acceptLabel || 'Accept Interest'}
            </span>
          </button>
        </div>
      ) : singleButton ? (
        <div className="rounded-b-3xl bg-slate-800">
          <button
            onClick={handleSingleButtonClick}
            disabled={
              pendingActionType === singleButton.actionType && pendingProfileId === profile.id
            }
            className="flex w-full flex-col items-center justify-center gap-2 py-4 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {singleButton.actionType === 'accept-again' ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                <CheckIcon className="h-6 w-6 text-white" />
              </div>
            ) : singleButton.actionType === 'unblock' ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-600">
                <NoSymbolIcon className="h-6 w-6 text-white" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-yellow-400">
                <NoSymbolIcon className="h-5 w-5 text-yellow-400" />
              </div>
            )}
            <span className={singleButton.actionType === 'accept-again' || singleButton.actionType === 'unblock' ? 'text-white' : 'text-yellow-400'}>
            {pendingActionType === singleButton.actionType && pendingProfileId === profile.id
              ? 'Please wait...'
              : singleButton.label}
            </span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 divide-x divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
          {actionButtons.map((action) => {
            const isPending =
              pendingActionType === action.key && pendingProfileId === profile.id
            const IconComponent = action.icon

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
                className="flex flex-col items-center justify-center gap-1.5 py-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700"
              >
                <IconComponent className="h-5 w-5" />
                <span className="leading-tight">
                  {isPending ? 'Please wait...' : action.label}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </article>
  )
}

