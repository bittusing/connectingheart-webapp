import { useUserProfile } from '../hooks/useUserProfile'
import { PencilIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { getGenderPlaceholder } from '../utils/imagePlaceholders'

export const MyProfilePage = () => {
  const { profile, loading } = useUserProfile()

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

  if (!profile) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          Failed to load profile. Please try refreshing the page.
        </p>
      </div>
    )
  }

  const profileId = profile.heartsId ? `HEARTS-${profile.heartsId}` : 'N/A'

  return (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative">
            <img
              src={profile.avatarUrl || getGenderPlaceholder(profile.gender)}
              alt={profile.name || 'Profile'}
              className="h-32 w-32 rounded-full object-cover ring-4 ring-pink-100 dark:ring-pink-900/30"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = getGenderPlaceholder(profile.gender)
              }}
            />
            <button className="absolute bottom-0 right-0 rounded-full bg-pink-500 p-2 text-white shadow-lg transition hover:bg-pink-600">
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs uppercase tracking-widest text-slate-400">Profile ID</p>
            <p className="mt-1 font-display text-2xl font-semibold text-slate-900 dark:text-white">
              {profileId}
            </p>
            <button className="mt-4 flex items-center justify-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-600 sm:inline-flex">
              <PhotoIcon className="h-4 w-4" />
              <span>+ Add More Photos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Basic Details Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            Basic Details
          </h2>
          <button className="rounded-lg bg-pink-50 p-2 text-pink-600 transition hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400">
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <DetailRow label="Name" value={profile.name || 'Not set'} />
          <DetailRow label="Gender" value={profile.gender || 'Not set'} />
          <DetailRow label="Email" value={profile.email || 'Not set'} />
          <DetailRow label="Phone" value={profile.phoneNumber || 'Not set'} />
        </div>
      </div>

      {/* Critical Field Section */}
      <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm dark:border-yellow-800 dark:bg-yellow-900/20">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-red-600 dark:text-red-400">
            Critical Field
          </h2>
          <button className="rounded-lg bg-yellow-100 p-2 text-yellow-700 transition hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300">
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <DetailRow label="Date of Birth" value="Not set" />
          <DetailRow label="Marital Status" value="Not set" />
        </div>
      </div>

      {/* About Me Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            About Me
          </h2>
          <button className="rounded-lg bg-pink-50 p-2 text-pink-600 transition hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400">
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">
          {profile.description ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">{profile.description}</p>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Tell us About Yourself
              </p>
              <p className="mt-1 text-xs text-red-500">Not Filled</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-start sm:gap-4">
    <span className="w-full flex-shrink-0 text-sm font-medium text-slate-700 dark:text-slate-300 sm:w-32">
      {label}:
    </span>
    <span className="flex-1 text-sm text-slate-600 dark:text-slate-400">{value}</span>
  </div>
)

