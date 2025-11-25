import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  PaperAirplaneIcon,
  PhoneIcon,
  UserPlusIcon,
  NoSymbolIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { useProfileDetail } from '../hooks/useProfileDetail'
import { useProfileActions } from '../hooks/useProfileActions'
import { useUnlockProfile } from '../hooks/useUnlockProfile'
import { Toast } from '../components/common/Toast'
import { ConfirmModal } from '../components/forms/ConfirmModal'


type TabType = 'basic' | 'family' | 'kundali' | 'match'
type ToastVariant = 'success' | 'error'

type ToastMessage = {
  id: string
  message: string
  variant: ToastVariant
}

const TabButton = ({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={`relative whitespace-nowrap px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${
      isActive
        ? 'text-pink-600 dark:text-pink-400'
        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
    }`}
  >
    {label}
    {isActive && (
      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 dark:bg-pink-400" />
    )}
  </button>
)

const InfoRow = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null
  return (
    <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-start sm:gap-4">
      <span className="w-full flex-shrink-0 text-sm font-medium text-slate-700 dark:text-slate-300 sm:w-32">
        {label}:
      </span>
      <span className="flex-1 text-sm text-slate-600 dark:text-slate-400">{value}</span>
    </div>
  )
}

const CriticalField = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null
  return (
    <div className="rounded-lg bg-yellow-50 px-4 py-3 dark:bg-yellow-900/20">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
        <span className="w-full flex-shrink-0 text-sm font-medium text-slate-700 dark:text-slate-300 sm:w-32">
          {label}:
        </span>
        <span className="flex-1 text-sm text-slate-600 dark:text-slate-400">{value}</span>
      </div>
    </div>
  )
}

export const ProfileViewPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('basic')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { profile, loading, error } = useProfileDetail(id)
  const {
    sendInterest,
    unsendInterest,
    shortlistProfile,
    unshortlistProfile,
    ignoreProfile,
    unignoreProfile,
    pendingAction,
  } = useProfileActions()
  const { unlockProfile, isUnlocking } = useUnlockProfile()
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [hasSentInterest, setHasSentInterest] = useState(false)
  const [isShortlisted, setIsShortlisted] = useState(false)
  const [isIgnored, setIsIgnored] = useState(false)
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false)

  const handleAction = (action: string) => {
    if (action === 'contact') {
      setIsUnlockModalOpen(true)
    }
  }

  const showToast = (message: string, variant: ToastVariant) => {
    const id = globalThis.crypto?.randomUUID() ?? `${Date.now()}`
    setToasts((prev) => [...prev, { id, message, variant }])
  }

  const dismissToast = (toastId: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId))
  }

  const profileClientId = profile?.id || id || ''
  const isInterestPending =
    pendingAction?.profileId === profileClientId &&
    (pendingAction?.type === 'send-interest' || pendingAction?.type === 'unsend-interest')
  const isShortlistPending =
    pendingAction?.profileId === profileClientId &&
    (pendingAction?.type === 'shortlist' || pendingAction?.type === 'unshortlist')
  const isIgnorePending =
    pendingAction?.profileId === profileClientId &&
    (pendingAction?.type === 'ignore' || pendingAction?.type === 'unignore')

  const handleSendInterest = async () => {
    if (!profileClientId) {
      showToast('Profile information unavailable. Please refresh and try again.', 'error')
      return
    }

    try {
      const response = await sendInterest(profileClientId)
      setHasSentInterest(true)
      showToast(response?.message ?? 'Interest sent successfully.', 'success')
    } catch (err) {
      const message =
        err instanceof Error ? err.message.replace('API ', '') || 'Unable to send interest.' : 'Unable to send interest.'
      showToast(message, 'error')
    }
  }

  const handleUnsendInterest = async () => {
    if (!profileClientId) {
      showToast('Profile ID is required. Please refresh and try again.', 'error')
      return
    }

    try {
      const response = await unsendInterest(profileClientId)
      setHasSentInterest(false)
      showToast(response?.message ?? 'Interest unsent successfully.', 'success')
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message.replace('API ', '') || 'Unable to unsend interest.'
          : 'Unable to unsend interest.'
      showToast(message, 'error')
    }
  }

  const handleUnlockCancel = () => {
    if (!isUnlocking) {
      setIsUnlockModalOpen(false)
    }
  }

  const handleUnlockContact = async () => {
    if (!profileClientId) {
      showToast('Profile information unavailable. Please refresh and try again.', 'error')
      setIsUnlockModalOpen(false)
      return
    }

    if (isUnlocking) return

    try {
      const response = await unlockProfile(profileClientId)

      if (response.code === 'CH400') {
        const unlockError = response.err
        const isAlreadyUnlocked =
          typeof unlockError === 'string' && unlockError.toLowerCase().includes('already unlocked')

        const errorMessage =
          typeof unlockError === 'string'
            ? unlockError
            : unlockError?.msg ||
              response.message ||
              'Please renew your membership in order to unlock further profiles.'

        showToast(errorMessage, isAlreadyUnlocked ? 'success' : 'error')

        if (typeof unlockError !== 'string' && unlockError?.redirectToMembership) {
          navigate('/dashboard/membership')
        }
        return
      }

      showToast(response.message ?? 'Profile unlocked successfully.', 'success')
    } catch (err) {
      const message =
        err instanceof Error ? err.message.replace('API ', '') || 'Unable to unlock profile.' : 'Unable to unlock profile.'
      showToast(message, 'error')
    } finally {
      setIsUnlockModalOpen(false)
    }
  }

  const handleShortlist = async () => {
    if (!profileClientId) {
      showToast('Profile ID is required. Please refresh and try again.', 'error')
      return
    }

    try {
      const response = await (isShortlisted ? unshortlistProfile(profileClientId) : shortlistProfile(profileClientId))
      setIsShortlisted((prev) => !prev)
      showToast(
        response?.message ?? (isShortlisted ? 'Profile removed from shortlist.' : 'Profile shortlisted successfully.'),
        'success',
      )
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message.replace('API ', '') || 'Unable to update shortlist.'
          : 'Unable to update shortlist.'
      showToast(message, 'error')
    }
  }

  const handleIgnore = async () => {
    if (!profileClientId) {
      showToast('Profile ID is required. Please refresh and try again.', 'error')
      return
    }

    try {
      const response = await (isIgnored ? unignoreProfile(profileClientId) : ignoreProfile(profileClientId))
      setIsIgnored((prev) => !prev)
      showToast(
        response?.message ?? (isIgnored ? 'Profile restored.' : 'Profile ignored successfully.'),
        'success',
      )
    } catch (err) {
      const message =
        err instanceof Error ? err.message.replace('API ', '') || 'Unable to update ignore state.' : 'Unable to update.'
      showToast(message, 'error')
    }
  }

  const handleChat = async () => {
    showToast('Chat coming soon.', 'success')
  }

  useEffect(() => {
    setHasSentInterest(false)
    setIsShortlisted(Boolean(profile?.isShortlisted))
    setIsIgnored(Boolean(profile?.isIgnored))
  }, [profile?.id, profile?.isShortlisted, profile?.isIgnored])

  const handleNextImage = () => {
    if (profile?.allProfilePics && profile.allProfilePics.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % profile.allProfilePics!.length)
    }
  }

  const handlePrevImage = () => {
    if (profile?.allProfilePics && profile.allProfilePics.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + profile.allProfilePics!.length) % profile.allProfilePics!.length)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent"></div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          {error || 'Profile not found'}
        </p>
        <p className="mt-2 text-xs text-red-500 dark:text-red-400">
          Please try again or contact support if the issue persists.
        </p>
      </div>
    )
  }

  const renderBasicDetails = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <InfoRow label="Profile ID" value={profile.profileId} />
        <InfoRow label="Height" value={profile.height} />
        <InfoRow label="Location" value={profile.location} />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Critical Fields
        </h3>
        <CriticalField label="Date of Birth" value={profile.dateOfBirth} />
        <CriticalField label="Marital Status" value={profile.maritalStatus} />
        <CriticalField label="Caste" value={profile.caste} />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          About Me
        </h3>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {profile.aboutMe}
          </p>
        </div>
        <InfoRow label="Profile Managed by" value={profile.profileManagedBy} />
        <InfoRow label="Body Type" value={profile.bodyType} />
        <InfoRow label="Thalassemia" value={profile.thalassemia} />
        <InfoRow label="HIV Positive" value={profile.hivPositive} />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Educational Details
        </h3>
        <InfoRow label="School" value={profile.school} />
        <InfoRow label="Qualification" value={profile.qualification} />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Career Details
        </h3>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {profile.aboutCareer}
          </p>
        </div>
        <InfoRow label="Employed In" value={profile.employedIn} />
        <InfoRow label="Occupation" value={profile.occupation} />
        <InfoRow label="Organisation Name" value={profile.organisationName} />
        <InfoRow
          label="Interested In Settling Abroad"
          value={profile.interestedInSettlingAbroad}
        />
        <InfoRow label="Income" value={profile.income} />
      </div>
    </div>
  )

  const renderFamilyDetails = () => {
    const family = profile.familyDetails
    if (!family) {
      return (
        <div className="space-y-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">No family details available.</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-pink-600 dark:text-pink-400">Family Details</h3>
        {family.aboutMyFamily && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {family.aboutMyFamily}
            </p>
          </div>
        )}
        <InfoRow label="Family Status" value={family.familyStatus} />
        <InfoRow label="Family Type" value={family.familyType} />
        <InfoRow label="Family Values" value={family.familyValues} />
        <InfoRow label="Family Income" value={family.familyIncome} />
        <InfoRow label="Father Occupation" value={family.fatherOccupation} />
        <InfoRow label="Mother Occupation" value={family.motherOccupation} />
        <InfoRow label="Brothers" value={family.brothers?.toString()} />
        <InfoRow label="Married Brothers" value={family.marriedBrothers?.toString()} />
        <InfoRow label="Sisters" value={family.sisters?.toString()} />
        <InfoRow label="Married Sisters" value={family.marriedSisters?.toString()} />
        <InfoRow label="My family based out of" value={family.familyBasedOutOf} />
        {family.gothra && <InfoRow label="Gothra" value={family.gothra} />}
      </div>
    )
  }

  const renderKundaliDetails = () => {
    const kundali = profile.kundaliDetails
    const lifestyle = profile.lifestyleData

    return (
      <div className="space-y-8">
        {/* Kundali & Astro Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-pink-600 dark:text-pink-400">
            Kundali & Astro
          </h3>
          <InfoRow label="Rashi" value={kundali?.rashi} />
          <InfoRow label="Nakshatra" value={kundali?.nakshatra} />
          <InfoRow label="Time of birth" value={kundali?.timeOfBirth} />
          <InfoRow label="Manglik" value={kundali?.manglik} />
          <InfoRow label="Horoscopes" value={kundali?.horoscope} />
        </div>

        {/* Life Style Section */}
        {lifestyle && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-pink-600 dark:text-pink-400">Life Style</h3>
            <InfoRow label="Dietary Habits" value={lifestyle.dietaryHabits} />
            <InfoRow label="Drinking Habits" value={lifestyle.drinkingHabits} />
            <InfoRow label="Smoking Habits" value={lifestyle.smokingHabits} />
            {lifestyle.languages && lifestyle.languages.length > 0 && (
              <InfoRow label="Language" value={lifestyle.languages.join(', ')} />
            )}
            {lifestyle.hobbies && lifestyle.hobbies.length > 0 && (
              <InfoRow label="Hobbies" value={lifestyle.hobbies.join(', ')} />
            )}
            {lifestyle.interest && lifestyle.interest.length > 0 && (
              <InfoRow label="Interest" value={lifestyle.interest.join(', ')} />
            )}
            {lifestyle.sports && lifestyle.sports.length > 0 && (
              <InfoRow label="Sports" value={lifestyle.sports.join(', ')} />
            )}
            {lifestyle.cuisine && lifestyle.cuisine.length > 0 && (
              <InfoRow label="Cuisine" value={lifestyle.cuisine.join(', ')} />
            )}
          </div>
        )}
      </div>
    )
  }

  const renderMatchDetails = () => {
    const matchData = profile.matchDetails?.matchData || []
    const matchPercentage = profile.matchDetails?.matchPercentage

    return (
      <div className="space-y-6">
        {matchPercentage && (
          <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-center text-white">
            <p className="text-sm uppercase tracking-wider opacity-90">Match Percentage</p>
            <p className="mt-2 text-5xl font-bold">{matchPercentage}%</p>
          </div>
        )}
        <div className="space-y-4">
          {matchData.map((match, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {match.label}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  ({match.value})
                </p>
              </div>
              <div className="ml-4">
                {match.isMatched ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-slate-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicDetails()
      case 'family':
        return renderFamilyDetails()
      case 'kundali':
        return renderKundaliDetails()
      case 'match':
        return renderMatchDetails()
      default:
        return renderBasicDetails()
    }
  }

  const currentImage = profile.allProfilePics?.[currentImageIndex] || { url: profile.avatar, id: 'primary' }
  const hasMultipleImages = (profile.allProfilePics?.length || 0) > 1

  return (
    <div className="space-y-6 pb-20 md:pb-24">
      {/* Profile Picture with Carousel */}
      <div className="relative mx-auto h-64 w-full max-w-2xl overflow-hidden rounded-3xl md:h-80 lg:h-96">
        {currentImage?.url ? (
          <img
            src={currentImage.url}
            alt={profile.name}
            className="h-full w-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-800">
            <svg
              className="h-24 w-24 text-slate-400"
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
        
        {/* Image Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Image Dots Indicator */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {profile.allProfilePics?.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 w-2 rounded-full transition ${
                  index === currentImageIndex
                    ? 'bg-white'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-1 overflow-x-auto sm:gap-2">
          <TabButton
            label="Basic Details"
            isActive={activeTab === 'basic'}
            onClick={() => setActiveTab('basic')}
          />
          <TabButton
            label="Family"
            isActive={activeTab === 'family'}
            onClick={() => setActiveTab('family')}
          />
          <TabButton
            label="Kundali"
            isActive={activeTab === 'kundali'}
            onClick={() => setActiveTab('kundali')}
          />
          <TabButton
            label="Match"
            isActive={activeTab === 'match'}
            onClick={() => setActiveTab('match')}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {renderTabContent()}
      </div>

      {/* Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-700 bg-slate-900 shadow-lg dark:border-slate-700 lg:left-[280px]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-1.5 px-2 py-2.5 sm:gap-2 sm:px-4 sm:py-3">
          <button
            onClick={hasSentInterest ? handleUnsendInterest : handleSendInterest}
            disabled={isInterestPending}
            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold text-white shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-2.5 sm:text-xs ${
              hasSentInterest
                ? 'bg-slate-800 hover:bg-slate-700'
                : 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/30 hover:shadow-lg hover:shadow-pink-500/40'
            }`}
            aria-label={hasSentInterest ? 'Withdraw Interest' : 'Send Interest'}
          >
            <PaperAirplaneIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="leading-tight">
              {isInterestPending ? 'Please wait...' : hasSentInterest ? 'Withdraw Interest' : 'Send Interest'}
            </span>
          </button>
          <button
            onClick={() => handleAction('contact')}
            className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-slate-800 px-2 py-2 text-[10px] font-semibold text-white transition-all hover:bg-slate-700 active:scale-95 sm:px-3 sm:py-2.5 sm:text-xs"
            aria-label="Contact"
          >
            <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="leading-tight">Contact</span>
          </button>
          <button
            onClick={handleShortlist}
            disabled={isShortlistPending}
            className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-slate-800 px-2 py-2 text-[10px] font-semibold text-white transition-all hover:bg-slate-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-2.5 sm:text-xs"
            aria-label="Shortlist"
          >
            <UserPlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="leading-tight">{isShortlistPending ? 'Please wait...' : isShortlisted ? 'Unshortlist' : 'Shortlist'}</span>
          </button>
          <button
            onClick={handleIgnore}
            disabled={isIgnorePending}
            className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-slate-800 px-2 py-2 text-[10px] font-semibold text-white transition-all hover:bg-slate-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-2.5 sm:text-xs"
            aria-label="Ignore"
          >
            <NoSymbolIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="leading-tight">{isIgnorePending ? 'Please wait...' : isIgnored ? 'Undo Ignore' : 'Ignore'}</span>
          </button>
          <button
            onClick={handleChat}
            // disabled={isChatPending}
            className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-slate-800 px-2 py-2 text-[10px] font-semibold text-white transition-all hover:bg-slate-700 active:scale-95 sm:px-3 sm:py-2.5 sm:text-xs"
            aria-label="Chat"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="leading-tight">Chat</span>
          </button>
        </div>
      </div>

      <ConfirmModal
        open={isUnlockModalOpen}
        title="Do you want to unlock this profile?"
        description="This will cost you 1 heart coin!"
        cancelLabel="Cancel"
        confirmLabel={isUnlocking ? 'Please wait...' : 'OK'}
        onCancel={handleUnlockCancel}
        onConfirm={handleUnlockContact}
      />

      <div className="pointer-events-none fixed top-6 right-6 z-50 space-y-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            onClose={() => dismissToast(toast.id)}
            className="pointer-events-auto"
          />
        ))}
      </div>
    </div>
  )
}