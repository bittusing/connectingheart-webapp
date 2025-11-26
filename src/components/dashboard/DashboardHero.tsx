import { Link, useNavigate } from 'react-router-dom'
import type { UserProfileSummary } from '../../types/dashboard'

type DashboardHeroProps = {
  profile?: UserProfileSummary
}

const defaultProfile: UserProfileSummary = {
  name: 'Your Profile',
  completionPercentage: 80,
  membershipTier: 'Essential',
  lookingFor: 'Looking For',
}

export const DashboardHero = ({ profile = defaultProfile }: DashboardHeroProps) => {
  const navigate = useNavigate()
  const displayProfile = { ...defaultProfile, ...profile }
  const openPartnerPreference = () => {
    navigate('/dashboard/partnerpreference')
  }

  // Determine default "Looking For" image based on user gender
  const getDefaultLookingForImage = () => {
    const gender = displayProfile.gender?.toLowerCase()
    if (gender === 'male' || gender === 'm') {
      return '/for-mans-girls.png'
    }
    return '/for-girls-man.png'
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 p-6 text-white shadow-2xl">
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            {displayProfile.avatar ? (
              <img
                src={displayProfile.avatar}
                alt="Your profile"
                className="h-20 w-20 rounded-full object-cover ring-4 ring-white/30"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30">
                <svg
                  className="h-10 w-10 text-white/70"
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
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 ring-2 ring-white"></div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/80">Your Profile</p>
            <p className="mt-1 font-display text-2xl font-semibold">{displayProfile.name}</p>
            <p className="text-sm text-white/70">
              Profile completion {displayProfile.completionPercentage}%
            </p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-white/80">Activate Your Plan</p>
          <div className="mt-3 rounded-2xl bg-white/20 px-6 py-3 backdrop-blur-sm">
            <p className="text-2xl font-semibold">{displayProfile.membershipTier}</p>
            {/* how to navigate to membership page */}
            <Link to="/dashboard/membership" className="text-xs text-white/80">
              <p className="mt-1 text-xs text-white/80">Upgrade for premium features</p>
            </Link>
            
          </div>
        </div>
        <button
          type="button"
          onClick={openPartnerPreference}
          className="flex items-center gap-4 rounded-3xl border border-white/0 bg-white/0 px-3 py-2 text-left transition hover:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label="Open partner preference editor"
        >
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-white/80">Looking For</p>
            <p className="mt-1 font-display text-2xl font-semibold">
              {displayProfile.lookingFor ?? 'Life Partner'}
            </p>
            <p className="text-sm text-white/70">Preferences saved</p>
          </div>
          <div className="relative">
            {displayProfile.lookingForAvatar ? (
              <img
                src={displayProfile.lookingForAvatar}
                alt="Looking for"
                className="h-20 w-20 rounded-full object-cover ring-4 ring-white/30"
              />
            ) : (
              <img
                src={getDefaultLookingForImage()}
                alt="Looking for"
                className="h-20 w-20 rounded-full object-cover ring-4 ring-white/30"
                onError={(e) => {
                  // Fallback to SVG if image fails to load
                  e.currentTarget.style.display = 'none'
                  const parent = e.currentTarget.parentElement
                  if (parent && !parent.querySelector('.fallback-svg')) {
                    const fallback = document.createElement('div')
                    fallback.className = 'fallback-svg flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30'
                    fallback.innerHTML = `
                      <svg class="h-10 w-10 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                      </svg>
                    `
                    parent.appendChild(fallback)
                  }
                }}
              />
            )}
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-blue-500 ring-2 ring-white"></div>
          </div>
        </button>
      </div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
    </section>
  )
}

