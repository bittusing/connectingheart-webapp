import { useState } from 'react'
import { useProfiles } from '../hooks/useProfiles'
import { ProfileActionCard } from '../components/dashboard/ProfileActionCard'
import { Pagination } from '../components/dashboard/Pagination'
import { useProfileActions } from '../hooks/useProfileActions'
import { Toast } from '../components/common/Toast'

type SingleButtonConfig = {
  label: string
  icon?: React.ReactNode
  actionType: 'unsend-interest' | 'unshortlist' | 'unignore'
}

type ProfileListTemplateProps = {
  title: string
  subtitle: string
  endpoint: string
  note?: string
  singleButton?: SingleButtonConfig
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
}: ProfileListTemplateProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const { profiles, loading, error, totalProfiles, totalPages, refetch } = useProfiles(endpoint, {
    page: currentPage,
  })
  const {
    sendInterest,
    shortlistProfile,
    ignoreProfile,
    unsendInterest,
    unshortlistProfile,
    unignoreProfile,
    pendingAction,
  } = useProfileActions()
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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

      switch (singleButton.actionType) {
        case 'unsend-interest':
          response = await unsendInterest(profileId)
          successMessage = response?.message ?? 'Interest cancelled successfully.'
          break
        case 'unshortlist':
          response = await unshortlistProfile(profileId)
          successMessage = response?.message ?? 'Profile removed from shortlist successfully.'
          break
        case 'unignore':
          response = await unignoreProfile(profileId)
          successMessage = response?.message ?? 'Profile removed from ignored list successfully.'
          break
        default:
          throw new Error('Unknown action type')
      }

      showToast(successMessage, 'success')
      await refetch({ silent: true })
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message.replace('API ', '') || `Unable to ${singleButton.label.toLowerCase()}.`
          : `Unable to ${singleButton.label.toLowerCase()}.`
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
            Showing {profiles.length} of {totalProfiles} profiles
          </p>
        )}
      </header>
      {profiles.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">No profiles found.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {profiles.map((profile) => (
              <ProfileActionCard
                key={profile.id}
                profile={profile}
                onSendInterest={singleButton ? undefined : handleSendInterest}
                onShortlist={singleButton ? undefined : handleShortlist}
                onIgnore={singleButton ? undefined : handleIgnore}
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
                pendingActionType={pendingAction?.type}
                pendingProfileId={pendingAction?.profileId}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
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
  />
)
export const UnlockedProfilesPage = () => (
  <ProfileListTemplate
    title="Unlocked Profiles"
    subtitle="Profiles you have unlocked to view contact details."
    endpoint="dashboard/getMyUnlockedProfiles"
  />
)
export const IDeclinedPage = () => (
  <ProfileListTemplate
    title="I Declined"
    subtitle="Profiles whose interest you have declined."
    endpoint="dashboard/getMyDeclinedProfiles"
  />
)
export const TheyDeclinedPage = () => (
  <ProfileListTemplate
    title="They Declined"
    subtitle="Profiles that declined your interest."
    endpoint="dashboard/getUsersWhoHaveDeclinedMe"
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
  />
)
export const BlockedProfilesPage = () => (
  <ProfileListTemplate
    title="Blocked Profiles"
    subtitle="Profiles you have blocked from contacting you."
    endpoint="dashboard/getMyBlockedProfiles"
  />
)

