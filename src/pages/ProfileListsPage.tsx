import { useState, useEffect, useRef, useMemo } from 'react'
import { useProfiles } from '../hooks/useProfiles'
import { ProfileActionCard } from '../components/dashboard/ProfileActionCard'
import { Pagination } from '../components/dashboard/Pagination'
import { useProfileActions } from '../hooks/useProfileActions'
import { Toast } from '../components/common/Toast'
import { useUpdateNotificationCount, type NotificationType } from '../hooks/useUpdateNotificationCount'

type SingleButtonConfig = {
  label: string
  icon?: React.ReactNode
  actionType: 'unsend-interest' | 'unshortlist' | 'unignore' | 'accept-again' | 'unblock'
}

type DualButtonConfig = {
  type: 'accept-decline'
}

type ProfileListTemplateProps = {
  title: string
  subtitle: string
  endpoint: string
  note?: string
  singleButton?: SingleButtonConfig
  dualButton?: DualButtonConfig
  hideButtons?: boolean
  notificationType?: NotificationType
}

type ToastVariant = 'success' | 'error'

type ToastMessage = {
  id: string
  message: string
  variant: ToastVariant
}

const ProfileListTemplate = ({
  title,
  subtitle,
  endpoint,
  note,
  singleButton,
  dualButton,
  hideButtons,
  notificationType,
}: ProfileListTemplateProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [displayedProfiles, setDisplayedProfiles] = useState<number>(5) // Start with 5 profiles
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const hasUpdatedNotification = useRef(false)
  // Get all profiles - use allProfiles for infinite scroll, profiles for desktop pagination
  const { profiles, allProfiles, loading, error, totalProfiles, totalPages, refetch } = useProfiles(endpoint, {
    page: currentPage,
  })
  const {
    sendInterest,
    shortlistProfile,
    ignoreProfile,
    unsendInterest,
    unshortlistProfile,
    unignoreProfile,
    unblockProfile,
    acceptInterest,
    declineInterest,
    pendingAction,
  } = useProfileActions()
  const { updateNotificationCount } = useUpdateNotificationCount()
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // Update notification count when profiles are loaded (mark as seen)
  useEffect(() => {
    if (notificationType && allProfiles.length > 0 && !hasUpdatedNotification.current) {
      hasUpdatedNotification.current = true
      const profileIds = allProfiles.map((profile) => profile.id)
      void updateNotificationCount(profileIds, notificationType)
    }
  }, [notificationType, allProfiles, updateNotificationCount])
  
  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Reset displayed profiles when allProfiles change - start with 5
  useEffect(() => {
    setDisplayedProfiles(5)
  }, [allProfiles.length])

  // Infinite scroll for mobile view - load 5 profiles at a time
  useEffect(() => {
    if (!isMobile || allProfiles.length === 0 || displayedProfiles >= allProfiles.length) {
      // Clean up observer if conditions not met
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
      return
    }

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Trigger when the element enters the viewport
          if (entry.isIntersecting) {
            setDisplayedProfiles((prev) => {
              if (prev >= allProfiles.length) return prev
              const next = Math.min(prev + 5, allProfiles.length)
              return next
            })
          }
        })
      },
      {
        root: null,
        rootMargin: '50px 0px', // Trigger 50px before element enters viewport (pre-load)
        threshold: [0, 0.1, 0.5], // Trigger at multiple thresholds for better detection
      },
    )

    observerRef.current = observer

    // Observe the trigger element - use requestAnimationFrame for better timing
    const rafId = requestAnimationFrame(() => {
      const currentRef = loadMoreRef.current
      if (currentRef && observerRef.current) {
        observerRef.current.observe(currentRef)
      }
    })

    return () => {
      cancelAnimationFrame(rafId)
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [displayedProfiles, allProfiles.length, isMobile])

  // Desktop pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Get profiles to display - mobile: one at a time from allProfiles, desktop: paginated profiles
  const profilesToDisplay = allProfiles.slice(0, displayedProfiles)
  
  // For desktop, use paginated profiles; for mobile, use displayedProfiles from allProfiles
  const finalProfilesToShow = useMemo(() => {
    return isMobile ? profilesToDisplay : profiles
  }, [isMobile, profilesToDisplay, profiles])

  const showToast = (message: string, variant: ToastVariant) => {
    const id = globalThis.crypto?.randomUUID() ?? `${Date.now()}`
    setToasts((prev) => [...prev, { id, message, variant }])
  }

  const dismissToast = (toastId: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId))
  }

  const handleSendInterest = async (profileId: string) => {
    if (!profileId) {
      showToast('Profile ID missing. Please refresh and try again.', 'error')
      return
    }

    try {
      const response = await sendInterest(profileId)
      showToast(response?.message ?? 'Interest sent successfully.', 'success')
      await refetch({ silent: true })
    } catch (err) {
      const message =
        err instanceof Error ? err.message.replace('API ', '') || 'Unable to send interest.' : 'Unable to send interest.'
      showToast(message, 'error')
    }
  }

  const handleShortlist = async (profileId: string) => {
    try {
      const response = await shortlistProfile(profileId)
      showToast(response?.message ?? 'Profile shortlisted successfully.', 'success')
      await refetch({ silent: true })
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message.replace('API ', '') || 'Unable to shortlist profile.'
          : 'Unable to shortlist profile.'
      showToast(message, 'error')
    }
  }

  const handleIgnore = async (profileId: string) => {
    try {
      const response = await ignoreProfile(profileId)
      showToast(response?.message ?? 'Profile ignored successfully.', 'success')
      await refetch({ silent: true })
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message.replace('API ', '') || 'Unable to ignore profile.'
          : 'Unable to ignore profile.'
      showToast(message, 'error')
    }
  }

  const handleSingleButtonAction = async (profileId: string) => {
    if (!singleButton) return

    try {
      let response
      let successMessage = ''
      let notificationTypeForUpdate: NotificationType | null = null

      switch (singleButton.actionType) {
        case 'unsend-interest':
          response = await unsendInterest(profileId)
          successMessage = response?.message ?? 'Interest cancelled successfully.'
          notificationTypeForUpdate = 'interestSent'
          break
        case 'unshortlist':
          response = await unshortlistProfile(profileId)
          successMessage = response?.message ?? 'Profile removed from shortlist successfully.'
          notificationTypeForUpdate = 'shortlistedProfile'
          break
        case 'unignore':
          response = await unignoreProfile(profileId)
          successMessage = response?.message ?? 'Profile removed from ignored list successfully.'
          notificationTypeForUpdate = 'ignoredProfile'
          break
        case 'accept-again':
          response = await acceptInterest(profileId)
          successMessage = response?.message ?? 'Interest accepted successfully.'
          notificationTypeForUpdate = 'iDeclined'
          break
        case 'unblock':
          response = await unblockProfile(profileId)
          successMessage = response?.message ?? 'Profile unblocked successfully.'
          notificationTypeForUpdate = 'blockedProfile'
          break
        default:
          throw new Error('Unknown action type')
      }

      showToast(successMessage, 'success')
      
      // Update notification count after action
      if (notificationTypeForUpdate) {
        const remainingIds = allProfiles
          .filter((p) => p.id !== profileId)
          .map((p) => p.id)
        if (remainingIds.length > 0) {
          void updateNotificationCount(remainingIds, notificationTypeForUpdate)
        }
      }
      
      await refetch({ silent: true })
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message.replace('API ', '') || `Unable to ${singleButton.label.toLowerCase()}.`
          : `Unable to ${singleButton.label.toLowerCase()}.`
      showToast(message, 'error')
    }
  }

  const handleAcceptInterest = async (profileId: string) => {
    try {
      const response = await acceptInterest(profileId)
      showToast(response?.message ?? 'Interest accepted successfully.', 'success')
      await refetch({ silent: true })
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message.replace('API ', '') || 'Unable to accept interest.'
          : 'Unable to accept interest.'
      showToast(message, 'error')
    }
  }

  const handleDeclineInterest = async (profileId: string) => {
    try {
      const response = await declineInterest(profileId)
      showToast(response?.message ?? 'Interest declined successfully.', 'success')
      await refetch({ silent: true })
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message.replace('API ', '') || 'Unable to decline interest.'
          : 'Unable to decline interest.'
      showToast(message, 'error')
    }
  }

  if (loading) {
    return (
      <section className="space-y-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-widest text-slate-400">Connecting Hearts</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
        </header>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent"></div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading profiles...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-widest text-slate-400">Connecting Hearts</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
        </header>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Error: {error}
          </p>
          <p className="mt-2 text-xs text-red-500 dark:text-red-400">
            Please try refreshing the page or contact support if the issue persists.
          </p>
        </div>
      </section>
    )
  }

  const content = (
    <section className="space-y-8">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-widest text-slate-400">Connecting Hearts</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-white">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
        {note && <p className="mt-2 text-xs text-pink-600">{note}</p>}
        {totalProfiles > 0 && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Showing {isMobile ? profilesToDisplay.length : profiles.length} of {totalProfiles} profiles
          </p>
        )}
      </header>
      {profiles.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">No profiles found.</p>
        </div>
      ) : (
        <>
          {/* Mobile: Single card at a time, Desktop: Grid layout */}
          <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-4 xl:grid-cols-3">
            {finalProfilesToShow.map((profile, index) => {
              // Set ref on the last displayed profile to trigger loading next batch
              // When user scrolls past the last displayed profile, load next 5
              const isLastCard = index === finalProfilesToShow.length - 1
              const isTriggerCard = isMobile && 
                displayedProfiles < allProfiles.length && 
                isLastCard
              
              return (
                <div
                  key={`${profile.id}-${index}`}
                  ref={isTriggerCard ? loadMoreRef : null}
                  className="flex flex-shrink-0 items-start justify-center md:items-center"
                >
                  <div className="w-full max-w-md">
                    <ProfileActionCard
                      profile={profile}
                      onSendInterest={singleButton || dualButton || hideButtons ? undefined : handleSendInterest}
                      onShortlist={singleButton || dualButton || hideButtons ? undefined : handleShortlist}
                      onIgnore={singleButton || dualButton || hideButtons ? undefined : handleIgnore}
                      singleButton={
                        singleButton
                          ? {
                              label: singleButton.label,
                              icon: singleButton.icon,
                              onClick: handleSingleButtonAction,
                              actionType: singleButton.actionType,
                            }
                          : undefined
                      }
                      dualButton={
                        dualButton
                          ? {
                              onAccept: handleAcceptInterest,
                              onDecline: handleDeclineInterest,
                            }
                          : undefined
                      }
                      hideButtons={hideButtons}
                      pendingActionType={pendingAction?.type}
                      pendingProfileId={pendingAction?.profileId}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          {!isMobile && totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </section>
  )

  return (
    <>
      {content}
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
    </>
  )
}

export const AllProfilesPage = () => (
  <ProfileListTemplate
    title="All Profiles"
    subtitle="Browse every compatible profile curated for you."
    endpoint="dashboard/getAllProfiles"
  />
)
export const DailyRecommendationsPage = () => (
  <ProfileListTemplate
    title="Daily Recommendations"
    subtitle="Fresh suggestions based on your preferences and activity."
    endpoint="interest/getDailyRecommendations"
    note="Updated every 24 hours"
  />
)
export const ProfileVisitorsPage = () => (
  <ProfileListTemplate
    title="Profile Visitors"
    subtitle="Members who recently viewed your profile."
    endpoint="dashboard/getProfileVisitors"
  />
)



export const InterestReceivedPage = () => (
  <ProfileListTemplate
    title="Interests Received"
    subtitle="Profiles that have sent you interest."
    endpoint="interest/getInterests"
    dualButton={{ type: 'accept-decline' }}
    notificationType="interestReceived"
  />
)
export const InterestSentPage = () => (
  <ProfileListTemplate
    title="Interests Sent"
    subtitle="Profiles you have sent interest to."
    endpoint="dashboard/getMyInterestedProfiles"
    singleButton={{
      label: 'Cancel Interest',
      actionType: 'unsend-interest',
    }}
    notificationType="interestSent"
  />
)
export const UnlockedProfilesPage = () => (
  <ProfileListTemplate
    title="Unlocked Profiles"
    subtitle="Profiles you have unlocked to view contact details."
    endpoint="dashboard/getMyUnlockedProfiles"
    notificationType="unlockedProfiles"
  />
)
export const IDeclinedPage = () => (
  <ProfileListTemplate
    title="I Declined"
    subtitle="Profiles whose interest you have declined."
    endpoint="dashboard/getMyDeclinedProfiles"
    singleButton={{
      label: 'Accept Again',
      actionType: 'accept-again',
    }}
    notificationType="iDeclined"
  />
)
export const TheyDeclinedPage = () => (
  <ProfileListTemplate
    title="They Declined"
    subtitle="Profiles that declined your interest."
    endpoint="dashboard/getUsersWhoHaveDeclinedMe"
    hideButtons
    notificationType="theyDeclined"
  />
)
export const ShortlistedProfilesPage = () => (
  <ProfileListTemplate
    title="Shortlisted Profiles"
    subtitle="Profiles you have saved for later review."
    endpoint="dashboard/getMyShortlistedProfiles"
    singleButton={{
      label: 'Remove from Shortlist',
      actionType: 'unshortlist',
    }}
    notificationType="shortlistedProfile"
  />
)
export const IgnoredProfilesPage = () => (
  <ProfileListTemplate
    title="Ignored Profiles"
    subtitle="Profiles you have chosen to ignore."
    endpoint="dashboard/getAllIgnoredProfiles"
    singleButton={{
      label: 'Remove',
      actionType: 'unignore',
    }}
    notificationType="ignoredProfile"
  />
)
export const BlockedProfilesPage = () => (
  <ProfileListTemplate
    title="Blocked Profiles"
    subtitle="Profiles you have blocked from contacting you."
    endpoint="dashboard/getMyBlockedProfiles"
    singleButton={{
      label: 'Unblock',
      actionType: 'unblock',
    }}
    notificationType="blockedProfile"
  />
)
export const JustJoinedPage = () => (
  <ProfileListTemplate
    title="Just Joined"
    subtitle="New profiles that recently joined the platform."
    endpoint="dashboard/getjustJoined"
  />
)


