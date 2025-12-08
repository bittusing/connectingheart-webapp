import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
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
  ArrowLeftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useProfileDetail } from '../hooks/useProfileDetail'
import { useProfileActions } from '../hooks/useProfileActions'
import { useUnlockProfile } from '../hooks/useUnlockProfile'
import { useUserProfile } from '../hooks/useUserProfile'
import { Toast } from '../components/common/Toast'
import { ConfirmModal } from '../components/forms/ConfirmModal'
import { getGenderPlaceholder } from '../utils/imagePlaceholders'


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
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<TabType>('basic')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { profile, loading, error, refetch } = useProfileDetail(id)
  const { profile: currentUserProfile } = useUserProfile()
  const {
    sendInterest,
    unsendInterest,
    shortlistProfile,
    unshortlistProfile,
    ignoreProfile,
    unignoreProfile,
    declineInterest,
    pendingAction,
  } = useProfileActions()
  
  // Check if user came from acceptance page
  const [isFromAcceptance, setIsFromAcceptance] = useState(false)
  
  useEffect(() => {
    // Check location state first (most reliable)
    if (location.state?.from === 'acceptance') {
      setIsFromAcceptance(true)
      return
    }
    // Fallback: check referrer
    if (typeof window !== 'undefined' && document.referrer) {
      const referrerUrl = new URL(document.referrer)
      setIsFromAcceptance(referrerUrl.pathname.includes('/acceptance'))
    }
  }, [location.state])
  const { unlockProfile, isUnlocking } = useUnlockProfile()
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [hasSentInterest, setHasSentInterest] = useState(false)
  const [isShortlisted, setIsShortlisted] = useState(false)
  const [isIgnored, setIsIgnored] = useState(false)
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false)
  const [isContactDetailsModalOpen, setIsContactDetailsModalOpen] = useState(false)
  const [shouldHighlightContact, setShouldHighlightContact] = useState(false)
  const hasManuallyClosedContactModal = useRef(false)
  
  // Refs for scroll-based tab switching
  const basicSectionRef = useRef<HTMLDivElement>(null)
  const familySectionRef = useRef<HTMLDivElement>(null)
  const kundaliSectionRef = useRef<HTMLDivElement>(null)
  const matchSectionRef = useRef<HTMLDivElement>(null)
  const contactSectionRef = useRef<HTMLDivElement>(null)

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

  const handleCloseContactModal = () => {
    setIsContactDetailsModalOpen(false)
    setShouldHighlightContact(false)
    hasManuallyClosedContactModal.current = true
  }

  const handleUnlockContact = async () => {
    if (!profileClientId) {
      showToast('Profile information unavailable. Please refresh and try again.', 'error')
      setIsUnlockModalOpen(false)
      return
    }
    // console.log("isUnlocking",isUnlocking , );
    if (isUnlocking) return

    try {
      const response = await unlockProfile(profileClientId)
     console.log("response",response.code,response.err);
      if (response.code === 'CH400') {
         if((response.err as any)?.redirectToMembership) {
          setTimeout(() => {
            navigate('/dashboard/membership')
          }, 500)
          return
         }
        setIsUnlockModalOpen(false)
       showToast(response?.message ?? 'Profile unlocked successfully.', 'success')
      } else {
        // Unlock successful - refetch profile details in background to get contact info
        showToast(response.message ?? 'Profile unlocked successfully.', 'success')
        // Refetch profile details to get contact information
        setTimeout(() => {
          refetch()
        }, 500)
      }
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
    showToast('Chat Coming Soon', 'success')
  }

  const handleDeclined = async () => {
    if (!profileClientId) {
      showToast('Profile information unavailable. Please refresh and try again.', 'error')
      return
    }

    try {
      const response = await declineInterest(profileClientId)
      showToast(response?.message || 'Interest declined successfully', 'success')
      // Navigate back to acceptance page after declining
      navigate('/acceptance', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to decline interest'
      showToast(message, 'error')
    }
  }

  useEffect(() => {
    setHasSentInterest(false)
    setIsShortlisted(Boolean(profile?.isShortlisted))
    setIsIgnored(Boolean(profile?.isIgnored))
    // Reset the manual close flag when profile changes
    hasManuallyClosedContactModal.current = false
    console.log("profile",profile);
  }, [profile?.id, profile?.isShortlisted, profile?.isIgnored])

  // Show contact details modal when profile is unlocked and contact details are available
  // Only show if user hasn't manually closed it
  useEffect(() => {
    if (
      profile?.isUnlocked && 
      profile?.contactDetails && 
      !isContactDetailsModalOpen && 
      !hasManuallyClosedContactModal.current
    ) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        setIsContactDetailsModalOpen(true)
        setShouldHighlightContact(true)
        // Scroll to contact section
        setTimeout(() => {
          contactSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 200)
        // Remove highlight after 3 seconds
        setTimeout(() => {
          setShouldHighlightContact(false)
        }, 3000)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [profile?.isUnlocked, profile?.contactDetails, isContactDetailsModalOpen])

  // Scroll-based auto tab switching
  useEffect(() => {
    const sections = [
      { ref: basicSectionRef, tab: 'basic' as TabType },
      { ref: familySectionRef, tab: 'family' as TabType },
      { ref: kundaliSectionRef, tab: 'kundali' as TabType },
      { ref: matchSectionRef, tab: 'match' as TabType },
    ]

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const section = sections.find((s) => s.ref.current === entry.target)
          if (section) {
            setActiveTab(section.tab)
          }
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    sections.forEach(({ ref }) => {
      if (ref.current) {
        observer.observe(ref.current)
      }
    })

    return () => {
      sections.forEach(({ ref }) => {
        if (ref.current) {
          observer.unobserve(ref.current)
        }
      })
    }
  }, [profile])

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

  const profilePlaceholder = getGenderPlaceholder(profile.gender)
  const viewerPlaceholder = getGenderPlaceholder(currentUserProfile?.gender)

  // Determine pronouns based on profile's gender
  // If profile is male (M), use "He/His", if female (F), use "She/Her"
  const isProfileMale = profile.gender === 'M'
  const pronouns = {
    subject: isProfileMale ? 'He' : 'She',
    object: isProfileMale ? 'Him' : 'Her',
    possessive: isProfileMale ? 'His' : 'Her',
    reflexive: isProfileMale ? 'Him' : 'Her',
  }

  const renderBasicDetails = () => (
    <div ref={basicSectionRef} className="space-y-6">
      {/* Profile Attributes */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Height</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{profile.height || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Location</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{profile.location || 'N/A'}</p>
          </div>
        </div>
        {profile.caste && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Caste</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{profile.caste}</p>
            </div>
          </div>
        )}
        {profile.income && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Income</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{profile.income}</p>
            </div>
          </div>
        )}
        {profile.maritalStatus && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Marital Status</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{profile.maritalStatus}</p>
            </div>
          </div>
        )}
        {profile.bodyType && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Body Type</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{profile.bodyType}</p>
            </div>
          </div>
        )}
        {profile.disability && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Disability</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{profile.disability}</p>
            </div>
          </div>
        )}
        {profile.thalassemia && profile.thalassemia !== 'N/A' && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Thalassemia</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{profile.thalassemia}</p>
            </div>
          </div>
        )}
        {profile.hivPositive && profile.hivPositive !== 'N/A' && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">HIV Positive</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{profile.hivPositive}</p>
            </div>
          </div>
        )}
      </div>

      {/* About Me */}
      {profile.aboutMe && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">About Me</h3>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {profile.aboutMe}
            </p>
          </div>
        </div>
      )}

      {/* Career */}
      {(profile.occupation || profile.employedIn || profile.organisationName || profile.aboutCareer || profile.interestedInSettlingAbroad) && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Career</h3>
          {profile.occupation && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Occupation</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{profile.occupation}</p>
              </div>
            </div>
          )}
          {profile.employedIn && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Employed In</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{profile.employedIn}</p>
              </div>
            </div>
          )}
          {profile.organisationName && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Organisation</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{profile.organisationName}</p>
              </div>
            </div>
          )}
          {profile.aboutCareer && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">About Career</h4>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {profile.aboutCareer}
              </p>
            </div>
          )}
          {profile.interestedInSettlingAbroad && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Interested in Settling Abroad</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{profile.interestedInSettlingAbroad}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Education */}
      {(profile.qualification || profile.school || profile.otherUGDegree || profile.aboutEducation) && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Education</h3>
          {profile.qualification && (
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{profile.qualification}</p>
                {profile.otherUGDegree && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{profile.otherUGDegree}</p>
                )}
                {profile.school && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{profile.school}</p>
                )}
              </div>
            </div>
          )}
          {profile.aboutEducation && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">About Education</h4>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {profile.aboutEducation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Critical Fields */}
      {(profile.dateOfBirth || profile.caste) && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Critical Fields
          </h3>
          {profile.dateOfBirth && <CriticalField label="Date of Birth" value={profile.dateOfBirth} />}
          {profile.caste && <CriticalField label="Caste" value={profile.caste} />}
        </div>
      )}

      {/* Contact Information */}
      {profile.isUnlocked && profile.contactDetails && (
        <div 
          ref={contactSectionRef}
          className={`space-y-3 rounded-lg border-2 p-4 transition-all duration-500 ${
            shouldHighlightContact
              ? 'border-pink-500 bg-pink-50 shadow-lg dark:border-pink-400 dark:bg-pink-900/20'
              : 'border-transparent'
          }`}
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Contact Information
          </h3>
          {profile.contactDetails.name && (
            <InfoRow label="Name" value={profile.contactDetails.name} />
          )}
          {profile.contactDetails.phoneNumber && (
            <InfoRow label="Phone Number" value={profile.contactDetails.phoneNumber} />
          )}
          {profile.contactDetails.altMobileNumber && (
            <InfoRow label="Alternate Mobile" value={profile.contactDetails.altMobileNumber} />
          )}
          {profile.contactDetails.landline && (
            <InfoRow label="Landline" value={profile.contactDetails.landline} />
          )}
          {profile.contactDetails.email && (
            <InfoRow label="Email" value={profile.contactDetails.email} />
          )}
          {profile.contactDetails.alternateEmail && (
            <InfoRow label="Alternate Email" value={profile.contactDetails.alternateEmail} />
          )}
        </div>
      )}
    </div>
  )

  const renderFamilyDetails = () => {
    const family = profile.familyDetails
    if (!family) {
      return (
        <div ref={familySectionRef} className="space-y-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">No family details available.</p>
        </div>
      )
    }

    const siblingsInfo = []
    if (family.brothers !== undefined) {
      siblingsInfo.push(`${family.brothers} Brother${family.brothers !== 1 ? 's' : ''} (${family.marriedBrothers || 0} Married)`)
    }
    if (family.sisters !== undefined) {
      siblingsInfo.push(`${family.sisters} Sister${family.sisters !== 1 ? 's' : ''} (${family.marriedSisters || 0} Married)`)
    }

    return (
      <div ref={familySectionRef} className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Family</h3>
        
        {family.familyType && family.familyBasedOutOf && (
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {family.familyType} from {family.familyBasedOutOf}
              </p>
              {family.familyValues && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {family.familyValues}
                </p>
              )}
              {family.gothra && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {family.gothra} Gotra
                </p>
              )}
            </div>
          </div>
        )}

        {(family.fatherOccupation || family.motherOccupation) && (
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {family.fatherOccupation && `Father is ${family.fatherOccupation}`}
                {family.fatherOccupation && family.motherOccupation && ' & '}
                {family.motherOccupation && `Mother is ${family.motherOccupation}`}
              </p>
              {siblingsInfo.length > 0 && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {siblingsInfo.join(' & ')}
                  {family.familyIncome && ` • Earns ${family.familyIncome}`}
                </p>
              )}
            </div>
          </div>
        )}

        {family.aboutMyFamily && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">About {pronouns.possessive.toLowerCase()} family</h4>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {family.aboutMyFamily}
            </p>
          </div>
        )}

        {family.livingWithParents && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Living with Parents</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{family.livingWithParents}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderKundaliDetails = () => {
    const kundali = profile.kundaliDetails
    console.log('kundali', kundali)
    const lifestyle = profile.lifestyleData

    return (
      <div ref={kundaliSectionRef} className="space-y-8">
        {/* Kundali & Astro Section */}
        {(kundali?.rashi || kundali?.nakshatra || kundali?.timeOfBirth || kundali?.manglik || kundali?.horoscope) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Kundali & Astro</h3>
            {kundali?.timeOfBirth ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{kundali?.timeOfBirth || ''}</p>
              </div>
            ) : null}
            {kundali?.rashi && <InfoRow label="Rashi" value={kundali.rashi} />}
            {kundali?.nakshatra && <InfoRow label="Nakshatra" value={kundali.nakshatra} />}
            {kundali?.manglik && <InfoRow label="Manglik" value={kundali.manglik} />}
            {kundali?.horoscope && (
              <div className="inline-flex items-center gap-2 rounded-lg bg-orange-100 px-3 py-2 dark:bg-orange-900/20">
                <svg className="h-4 w-4 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Horoscope match is Must
                </span>
              </div>
            )}
          </div>
        )}

        {/* Lifestyle Section - Only show if at least one habit exists */}
        {lifestyle && (lifestyle.drinkingHabits || lifestyle.dietaryHabits || lifestyle.smokingHabits) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Lifestyle and Interests</h3>
            
            {/* Habits Cards */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">{pronouns.possessive} Habits</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                {lifestyle.drinkingHabits && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
                    {/* Wine Glass Icon */}
                    <svg className="mx-auto h-10 w-10 text-slate-600 dark:text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18,20H13V14.94A9,9,0,0,0,21,6a8.72,8.72,0,0,0-.67-3.39,1,1,0,0,0-.22-.32L20,2.21a.92.92,0,0,0-.21-.13A.94.94,0,0,0,19.51,2l-.1,0H4.59L4.5,2a.94.94,0,0,0-.29.06A2.12,2.12,0,0,0,4,2.2l-.12.09a1,1,0,0,0-.22.32A8.72,8.72,0,0,0,3,6a9,9,0,0,0,8,8.94V20H6a1,1,0,0,0,0,2H18a1,1,0,0,0,0-2ZM5,6a6.91,6.91,0,0,1,.29-2H18.71A6.91,6.91,0,0,1,19,6,7,7,0,0,1,5,6Z" />
                    </svg>
                    <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {lifestyle.drinkingHabits === 'No' ? `${pronouns.subject} does not drink` : lifestyle.drinkingHabits === 'Yes' ? `${pronouns.subject} drinks` : `${pronouns.subject} ${lifestyle.drinkingHabits.toLowerCase()}`}
                    </p>
                  </div>
                )}
                {lifestyle.dietaryHabits && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
                    {/* Fork and Knife Icon */}
                    <svg className="mx-auto h-10 w-10 text-slate-600 dark:text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,2a1,1,0,0,0-1,1V8.46l-1,.67V3a1,1,0,0,0-2,0V9.13l-1-.67V3a1,1,0,0,0-2,0V9a1,1,0,0,0,.45.83L15,11.54V21a1,1,0,0,0,2,0V11.54l2.55-1.71A1,1,0,0,0,20,9V3A1,1,0,0,0,19,2ZM9,2H9A5,5,0,0,0,4,7v6a1,1,0,0,0,1,1H8v7a1,1,0,0,0,2,0V3A1,1,0,0,0,9,2ZM8,12H6V7A3,3,0,0,1,8,4.17Z" />
                    </svg>
                    <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {lifestyle.dietaryHabits === 'Vegetarian' ? `${pronouns.subject} is a vegetarian` : lifestyle.dietaryHabits === 'Non Vegetarian' ? `${pronouns.subject} is non-vegetarian` : `${pronouns.subject} is ${lifestyle.dietaryHabits.toLowerCase()}`}
                    </p>
                  </div>
                )}
                {lifestyle.smokingHabits && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
                    {/* Cigarette Icon */}
                    <svg className="mx-auto h-10 w-10 text-slate-600 dark:text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M15.708 7.692a2.77 2.77 0 0 0 .834-1.984 2.792 2.792 0 0 0-2.792-2.791v1.25c.85 0 1.542.691 1.542 1.541S14.6 7.25 13.75 7.25V8.5c1.867 0 3.333 1.525 3.333 3.392v1.858h1.25v-1.867c0-1.85-1.066-3.45-2.625-4.191ZM1.667 14.583h12.5v2.5h-12.5v-2.5Zm15.417 0h1.25v2.5h-1.25v-2.5Zm-.834 0H15v2.5h1.25v-2.5ZM12.083 9.75h1.275c1.559 0 2.892 1.125 2.892 2.633v1.367H15v-1.083c0-1.092-.767-1.709-1.642-1.709h-1.275a2.792 2.792 0 0 1 0-5.583v1.25c-.85 0-1.541.608-1.541 1.458s.691 1.667 1.541 1.667Z" />
                    </svg>
                    <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {lifestyle.smokingHabits === 'No' ? `${pronouns.subject} does not smoke` : lifestyle.smokingHabits === 'Yes' ? `${pronouns.subject} smokes` : `${pronouns.subject} ${lifestyle.smokingHabits.toLowerCase()}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Interests, Hobbies, etc. */}
            {lifestyle.hobbies && lifestyle.hobbies.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{pronouns.possessive} hobbies are</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{lifestyle.hobbies.join(', ')}</p>
              </div>
            )}
            {lifestyle.interest && lifestyle.interest.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{pronouns.possessive} interests are</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{lifestyle.interest.join(', ')}</p>
              </div>
            )}
            {lifestyle.languages && lifestyle.languages.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{pronouns.subject} can speak</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{lifestyle.languages.join(', ')}</p>
              </div>
            )}
            {lifestyle.sports && lifestyle.sports.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Sports {pronouns.object.toLowerCase()} enjoys</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{lifestyle.sports.join(', ')}</p>
              </div>
            )}
            {lifestyle.cuisine && lifestyle.cuisine.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Favourite Cuisine</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{lifestyle.cuisine.join(', ')}</p>
              </div>
            )}
          </div>
        )}

        {/* Additional Lifestyle Preferences */}
        {lifestyle && (lifestyle.movies || lifestyle.favRead || lifestyle.favTVShow || lifestyle.vacayDestination || 
          lifestyle.books || lifestyle.dress || lifestyle.favMusic || lifestyle.foodICook ||
          lifestyle.openToPets || lifestyle.ownAHouse || lifestyle.ownACar) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Other Preferences</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {lifestyle?.movies && (
                <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-2 flex items-center gap-2">
                    <svg className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Favourite Movies</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{lifestyle.movies}</p>
                </div>
              )}
              
              {lifestyle?.favTVShow && (
                <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-2 flex items-center gap-2">
                    <svg className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Favourite TV Show</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{lifestyle.favTVShow}</p>
                </div>
              )}
              
              {lifestyle?.favRead && (
                <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-2 flex items-center gap-2">
                    <svg className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Favourite Read</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{lifestyle.favRead}</p>
                </div>
              )}
              
              {lifestyle?.vacayDestination && (
                <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-2 flex items-center gap-2">
                    <svg className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Vacation Destination</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{lifestyle.vacayDestination}</p>
                </div>
              )}
            </div>

            {/* Array fields */}
            {lifestyle?.books && lifestyle.books.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Favourite Books</h4>
                <div className="flex flex-wrap gap-2">
                  {lifestyle.books.map((book, idx) => (
                    <span key={idx} className="rounded-full bg-pink-100 px-3 py-1 text-sm text-pink-700 dark:bg-pink-900/20 dark:text-pink-300">
                      {book}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {lifestyle?.dress && lifestyle.dress.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Dress Style</h4>
                <div className="flex flex-wrap gap-2">
                  {lifestyle.dress.map((style, idx) => (
                    <span key={idx} className="rounded-full bg-pink-100 px-3 py-1 text-sm text-pink-700 dark:bg-pink-900/20 dark:text-pink-300">
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {lifestyle?.favMusic && lifestyle.favMusic.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Favourite Music</h4>
                <div className="flex flex-wrap gap-2">
                  {lifestyle.favMusic.map((music, idx) => (
                    <span key={idx} className="rounded-full bg-pink-100 px-3 py-1 text-sm text-pink-700 dark:bg-pink-900/20 dark:text-pink-300">
                      {music}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Yes/No fields */}
            <div className="grid gap-3 sm:grid-cols-3">
              {lifestyle?.foodICook && (
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                  <svg className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Food I Cook</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{lifestyle.foodICook}</p>
                  </div>
                </div>
              )}
              
              {lifestyle?.openToPets && (
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                  <svg className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Open to Pets</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{lifestyle.openToPets}</p>
                  </div>
                </div>
              )}
              
              {lifestyle?.ownAHouse && (
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                  <svg className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Owns a House</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{lifestyle.ownAHouse}</p>
                  </div>
                </div>
              )}
              
              {lifestyle?.ownACar && (
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                  <svg className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Owns a Car</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{lifestyle.ownACar}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderMatchDetails = () => {
    const matchData = profile.matchDetails?.matchData || []
    const matchPercentage = profile.matchDetails?.matchPercentage
    const matchedCount = matchData.filter((m) => m.isMatched).length
    const totalCount = matchData.length || 15

    // Get profile images
    const profileImage = profile.avatar || profile.allProfilePics?.[0]?.url || profilePlaceholder
    const currentUserImage = currentUserProfile?.avatarUrl || viewerPlaceholder

    // Partner preferences/qualities (if available in matchDetails or can be extracted)
    const partnerQualities = profile.matchDetails?.partnerQualities || [
      'Understanding',
      'Respectful',
      'Good personality',
      'Mature',
    ]

    return (
      <div ref={matchSectionRef} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Who is {pronouns.object.toLowerCase()} looking for...
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            These are {pronouns.possessive.toLowerCase()} desired partner qualities
          </p>
          {partnerQualities.length > 0 && (
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
              {partnerQualities.join(', ')}
            </p>
          )}
        </div>

        {/* Match Summary with Images */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Profile Preference */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 sm:text-xs">{pronouns.possessive} Preference</p>
            <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-pink-500 sm:h-20 sm:w-20">
              <img
                src={profileImage}
                alt={profile.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = profilePlaceholder
                }}
              />
            </div>
          </div>

          {/* Connecting Line */}
          <div className="hidden flex-1 sm:block">
            <div className="relative">
              <div className="h-0.5 bg-slate-300 dark:bg-slate-600"></div>
            </div>
          </div>

          {/* Match Box - Center */}
          <div className="flex flex-1 flex-col items-center gap-2 sm:flex-initial">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 dark:border-slate-700 dark:bg-slate-800 sm:px-4 sm:py-3">
              <p className="text-center text-[10px] font-medium text-slate-700 dark:text-slate-300 sm:text-sm">
                You match {matchedCount}/{totalCount} of {pronouns.possessive.toLowerCase()} preference
              </p>
            </div>
            {matchPercentage && (
              <div className="rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-3 py-1.5 text-center sm:px-4 sm:py-2">
                <p className="text-lg font-bold text-white sm:text-2xl">{matchPercentage}%</p>
              </div>
            )}
          </div>

          {/* Connecting Line */}
          <div className="hidden flex-1 sm:block">
            <div className="relative">
              <div className="h-0.5 bg-slate-300 dark:bg-slate-600"></div>
            </div>
          </div>

          {/* You Match */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 sm:text-xs">You Match</p>
            <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-pink-500 sm:h-20 sm:w-20">
              <img
                src={currentUserImage}
                alt="Your profile"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = viewerPlaceholder
                }}
              />
            </div>
          </div>
        </div>

        {/* Basic Details */}
        {matchData.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Basic Details</h4>
            {matchData.map((match, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {match.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{match.value}</p>
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
        )}
      </div>
    )
  }


  const currentImage = profile.allProfilePics?.[currentImageIndex] || { url: profile.avatar, id: 'primary' }
  const hasMultipleImages = (profile.allProfilePics?.length || 0) > 1
  const heroImageSrc = currentImage?.url || profilePlaceholder

  return (
    <div className="space-y-0 pb-20 md:pb-24">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Profile Picture with Gradient Overlay */}
      <div className="relative mx-auto flex h-[60vh] min-h-[400px] w-full items-center justify-center overflow-hidden rounded-3xl bg-slate-200 dark:bg-slate-800 md:h-[70vh] lg:h-[80vh]">
        <img
          src={heroImageSrc}
          alt={profile.name}
          className="h-full w-full object-contain"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = profilePlaceholder
          }}
        />
        
        {/* Gradient Overlay with Profile Info */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 pb-12">
          <div className="space-y-2">
            {profile.profileId && profile.name !== profile.profileId && (
              <p className="text-xs font-semibold text-white/90">{profile.profileId}</p>
            )}
            <p className="text-2xl font-bold text-white sm:text-3xl">
              {profile.name}, {profile.age}
            </p>
            {profile.profileManagedBy && (
              <p className="text-xs text-white/80">Profile managed by {profile.profileManagedBy}</p>
            )}
          </div>
        </div>

        {/* Image Count Badge */}
        {hasMultipleImages && (
          <div className="absolute right-4 top-4 rounded-lg bg-black/50 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
            {currentImageIndex + 1} / {profile.allProfilePics?.length}
          </div>
        )}
        
        {/* Image Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition hover:bg-white/30"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition hover:bg-white/30"
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Image Dots Indicator */}
        {hasMultipleImages && (
          <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-2">
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

      {/* Tabs - Sticky */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
        <div className="flex gap-1 overflow-x-auto sm:gap-2">
          <TabButton
            label="Basic Details"
            isActive={activeTab === 'basic'}
            onClick={() => {
              setActiveTab('basic')
              basicSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          />
          <TabButton
            label="Family"
            isActive={activeTab === 'family'}
            onClick={() => {
              setActiveTab('family')
              familySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          />
          <TabButton
            label="Kundali"
            isActive={activeTab === 'kundali'}
            onClick={() => {
              setActiveTab('kundali')
              kundaliSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          />
          <TabButton
            label="Match"
            isActive={activeTab === 'match'}
            onClick={() => {
              setActiveTab('match')
              matchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          />
        </div>
      </div>

      {/* Tab Content - All sections visible for scroll detection */}
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {renderBasicDetails()}
        {renderFamilyDetails()}
        {renderKundaliDetails()}
        {renderMatchDetails()}
      </div>

      {/* Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-700 bg-slate-900 shadow-lg dark:border-slate-700 lg:left-[280px]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-1.5 px-2 py-2.5 sm:gap-2 sm:px-4 sm:py-3">
          {isFromAcceptance ? (
            // Custom buttons for acceptance page
            <>
              <button
                onClick={handleDeclined}
                disabled={pendingAction?.type === 'decline-interest' && pendingAction?.profileId === profileClientId}
                className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-red-500 px-2 py-2 text-[10px] font-semibold text-white transition-all hover:bg-red-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-2.5 sm:text-xs"
                aria-label="Declined"
              >
                <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="leading-tight">
                  {pendingAction?.type === 'decline-interest' && pendingAction?.profileId === profileClientId
                    ? 'Please wait...'
                    : 'Declined'}
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
                onClick={handleChat}
                className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-slate-800 px-2 py-2 text-[10px] font-semibold text-white transition-all hover:bg-slate-700 active:scale-95 sm:px-3 sm:py-2.5 sm:text-xs"
                aria-label="Chat"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="leading-tight">Chat</span>
              </button>
            </>
          ) : (
            // Default buttons for other pages
            <>
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
                className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-slate-800 px-2 py-2 text-[10px] font-semibold text-white transition-all hover:bg-slate-700 active:scale-95 sm:px-3 sm:py-2.5 sm:text-xs"
                aria-label="Chat"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="leading-tight">Chat</span>
              </button>
            </>
          )}
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

      {/* Contact Details Modal */}
      {isContactDetailsModalOpen && profile?.contactDetails && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Contact Information
              </h3>
              <button
                onClick={handleCloseContactModal}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              {profile.contactDetails.name && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Name</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {profile.contactDetails.name}
                  </span>
                </div>
              )}
              {profile.contactDetails.phoneNumber && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Phone Number</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {profile.contactDetails.phoneNumber}
                  </span>
                </div>
              )}
              {profile.contactDetails.altMobileNumber && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Alternate Mobile</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {profile.contactDetails.altMobileNumber}
                  </span>
                </div>
              )}
              {profile.contactDetails.landline && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Landline</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {profile.contactDetails.landline}
                  </span>
                </div>
              )}
              {profile.contactDetails.email && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white break-all">
                    {profile.contactDetails.email}
                  </span>
                </div>
              )}
              {profile.contactDetails.alternateEmail && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Alternate Email</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white break-all">
                    {profile.contactDetails.alternateEmail}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseContactModal}
                className="rounded-full bg-pink-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-pink-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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