import { useNavigate } from 'react-router-dom'
import {
  HeartIcon,
  LockClosedIcon,
  XMarkIcon,
  FlagIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline'
import { SparklesIcon } from '@heroicons/react/24/solid'

type NotificationCategory = {
  id: string
  label: string
  route: string
  icon: React.ReactNode
  color: string
}

export const NotificationPage = () => {
  const navigate = useNavigate()

  const categories: NotificationCategory[] = [
    {
      id: 'interest-received',
      label: 'Interests Received',
      route: '/dashboard/interestreceived',
      icon: (
        <div className="relative">
          <HeartIcon className="h-8 w-8 text-pink-500" />
          <SparklesIcon className="absolute -right-1 -top-1 h-4 w-4 text-yellow-400" />
        </div>
      ),
      color: 'hover:bg-pink-50 dark:hover:bg-pink-900/20',
    },
    {
      id: 'interest-sent',
      label: 'Interests Sent',
      route: '/dashboard/interestsent',
      icon: <HeartIcon className="h-8 w-8 text-pink-500" />,
      color: 'hover:bg-pink-50 dark:hover:bg-pink-900/20',
    },
    {
      id: 'unlocked-profiles',
      label: 'Unlocked Profiles',
      route: '/dashboard/unlockedprofiles',
      icon: (
        <div className="relative">
          <HeartIcon className="h-8 w-8 text-pink-500" />
          <LockClosedIcon className="absolute -right-1 -top-1 h-4 w-4 text-yellow-400" />
        </div>
      ),
      color: 'hover:bg-pink-50 dark:hover:bg-pink-900/20',
    },
    {
      id: 'i-declined',
      label: 'I Declined',
      route: '/dashboard/ideclined',
      icon: (
        <div className="relative">
          <HeartIcon className="h-8 w-8 text-orange-500" />
          <XMarkIcon className="absolute inset-0 m-auto h-5 w-5 text-white" />
        </div>
      ),
      color: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
    },
    {
      id: 'they-declined',
      label: 'They Declined',
      route: '/dashboard/theydeclined',
      icon: (
        <svg
          className="h-8 w-8 text-pink-500"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          <line x1="8" y1="8" x2="16" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="16" y1="8" x2="8" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
      color: 'hover:bg-pink-50 dark:hover:bg-pink-900/20',
    },
    {
      id: 'shortlisted',
      label: 'Shortlisted Profiles',
      route: '/dashboard/shortlist',
      icon: (
        <div className="relative">
          <FlagIcon className="h-8 w-8 text-red-500" />
          <HeartIcon className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-white" />
        </div>
      ),
      color: 'hover:bg-red-50 dark:hover:bg-red-900/20',
    },
    {
      id: 'ignored',
      label: 'Ignored Profiles',
      route: '/dashboard/ignored',
      icon: (
        <div className="relative">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-yellow-400" />
          <div className="absolute inset-0 flex items-center justify-center">
            <NoSymbolIcon className="h-5 w-5 text-white" />
          </div>
        </div>
      ),
      color: 'hover:bg-slate-50 dark:hover:bg-slate-800',
    },
    {
      id: 'blocked',
      label: 'Blocked Profiles',
      route: '/dashboard/blocked',
      icon: (
        <div className="relative">
          <div className="h-8 w-8 rounded-full bg-red-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <NoSymbolIcon className="h-5 w-5 text-white" />
          </div>
        </div>
      ),
      color: 'hover:bg-red-50 dark:hover:bg-red-900/20',
    },
  ]

  return (
    <section className="space-y-8">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-widest text-slate-400">Connecting Hearts</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-white">
          Notifications
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Manage your profile interactions and connections
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => navigate(category.route)}
            className={`flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${category.color}`}
          >
            <div className="flex-shrink-0">{category.icon}</div>
            <span className="flex-1 text-base font-medium text-slate-900 dark:text-white">
              {category.label}
            </span>
            <svg
              className="h-5 w-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </section>
  )
}

