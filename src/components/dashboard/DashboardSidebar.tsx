import { NavLink } from 'react-router-dom'
import { navItems } from '../../data/dashboardContent'
import { DashboardIcon } from './DashboardIcon'
import { useUserProfile } from '../../hooks/useUserProfile'
import { PencilIcon } from '@heroicons/react/24/outline'

const handleLogout = () => {
  window.localStorage.removeItem('connectingheart-token')
  window.location.href = '/login'
}

type DashboardSidebarProps = {
  showUserProfile?: boolean
}

export const DashboardSidebar = ({ showUserProfile = false }: DashboardSidebarProps) => {
  const { profile } = useUserProfile()

  return (
    <div className="flex h-full flex-col">
      {showUserProfile && profile && (
        <div className="mb-6 flex items-center gap-4 rounded-lg bg-white/5 p-4">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name || 'Profile'}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-white/20"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-2 ring-white/20">
              <svg className="h-8 w-8 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate font-semibold text-white">{profile.name || 'User'}</p>
            <NavLink
              to="/dashboard/myprofile"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  const event = new Event('closemobilemenu')
                  window.dispatchEvent(event)
                }
              }}
              className="mt-1 flex items-center gap-1.5 text-xs text-white/70 hover:text-white"
            >
              <PencilIcon className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </NavLink>
          </div>
        </div>
      )}
      <div className="pb-6 pt-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Menu</p>
      </div>
      <nav className="flex flex-1 flex-col space-y-1">
        {navItems.map((item) => {
          if (item.label === 'Logout') {
            return (
              <button
                key={item.label}
                onClick={handleLogout}
                className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
              >
                <span className="flex items-center gap-3">
                  <DashboardIcon name={item.icon} className="h-5 w-5" />
                  {item.label}
                </span>
              </button>
            )
          }
          if (item.external) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    const event = new Event('closemobilemenu')
                    window.dispatchEvent(event)
                  }
                }}
                className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <DashboardIcon name={item.icon} className="h-5 w-5" />
                  {item.label}
                </span>
                {item.badge && (
                  <span className="rounded-full bg-pink-500/30 px-3 py-1 text-xs font-semibold text-pink-100">
                    {item.badge}
                  </span>
                )}
              </a>
            )
          }
          return (
            <NavLink
              key={item.label}
              to={item.href}
              onClick={() => {
                // Close mobile sidebar on navigation
                if (window.innerWidth < 1024) {
                  const event = new Event('closemobilemenu')
                  window.dispatchEvent(event)
                }
              }}
              className={({ isActive }) =>
                [
                  'flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-pink-500/20 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white',
                ].join(' ')
              }
            >
              <span className="flex items-center gap-3">
                <DashboardIcon name={item.icon} className="h-5 w-5" />
                {item.label}
              </span>
              {item.badge && (
                <span className="rounded-full bg-pink-500/30 px-3 py-1 text-xs font-semibold text-pink-100">
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}

