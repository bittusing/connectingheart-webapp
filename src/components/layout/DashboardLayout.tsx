import { useEffect, useState } from 'react'
import {
  BellAlertIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  SparklesIcon,
  UserGroupIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { DashboardSidebar } from '../dashboard/DashboardSidebar'
import { NotificationCountProvider } from '../../context/NotificationCountContext'
import { useNotificationCounts } from '../../hooks/useNotificationCounts'

export const DashboardLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { counts, loading, refetch } = useNotificationCounts()
  const notificationCount = counts.total || 0
  const isProfileViewPage = location.pathname.startsWith('/dashboard/profile/')
  const showBottomNav = !isProfileViewPage

  // Close mobile menu on window resize to desktop and handle body scroll
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }

    // Close menu when clicking outside on mobile
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (sidebarOpen && !target.closest('.mobile-sidebar') && !target.closest('.menu-button')) {
        setSidebarOpen(false)
      }
    }

    // Listen for custom close event from sidebar nav links
    const handleCloseMenu = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      }
    }

    // Prevent body scroll when mobile menu is open
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('closemobilemenu', handleCloseMenu)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('closemobilemenu', handleCloseMenu)
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  const mobileNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { label: 'Search', href: '/dashboard/search', icon: MagnifyingGlassIcon },
    { label: 'Daily Picks', href: '/dashboard/recommendations', icon: SparklesIcon },
    { label: 'Profiles', href: '/dashboard/profiles', icon: UserGroupIcon },
    { label: 'Membership', href: '/dashboard/membership', icon: CreditCardIcon },
  ]

  const LayoutContent = (
    <div className="flex min-h-screen bg-slate-50 pb-20 lg:pb-0">
      {/* Desktop Sidebar - Always visible on left */}
      <aside className="hidden lg:block lg:w-72 lg:flex-shrink-0">
        <div className="fixed left-0 top-0 h-screen w-72 overflow-y-auto bg-slate-900 p-6 text-slate-200">
          <DashboardSidebar showUserProfile={true} />
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/50 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`mobile-sidebar fixed inset-y-0 left-0 z-[60] w-72 transform overflow-y-auto bg-slate-900 p-6 text-slate-200 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-4 top-4 rounded-lg bg-white/10 p-2 text-white transition hover:bg-white/20"
          aria-label="Close menu"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <DashboardSidebar showUserProfile={true} />
      </div>

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 bg-gradient-to-r from-pink-600 to-rose-500 px-4 py-4 text-white shadow-lg lg:px-6 lg:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="menu-button rounded-lg bg-white/15 p-2 text-white transition hover:bg-white/25 lg:hidden"
                aria-label="Open menu"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <p className="text-xl font-semibold tracking-wide lg:text-2xl">Connecting Hearts</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard/search')}
                className="rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/dashboard/notification')}
                className="relative rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
                aria-label="Notifications"
              >
                <BellAlertIcon className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-semibold text-white">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          className={`flex-1 px-4 pt-4 pb-8 ${showBottomNav ? 'pb-28' : 'pb-12'} lg:px-6 lg:pt-6 lg:pb-12`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )

  return (
    <NotificationCountProvider counts={counts} loading={loading} refetch={refetch}>
      {LayoutContent}
      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.08)] dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          <div className="mx-auto grid max-w-4xl grid-cols-5 gap-1 px-2 py-2">
            {mobileNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  [
                    'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium transition',
                    isActive
                      ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-300'
                      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                  ].join(' ')
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="leading-tight">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </NotificationCountProvider>
  )
}

