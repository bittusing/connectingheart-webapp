import { NavLink } from 'react-router-dom'
import { navItems } from '../../data/dashboardContent'
import { DashboardIcon } from './DashboardIcon'

const handleLogout = () => {
  window.localStorage.removeItem('connectingheart-token')
  window.location.href = '/login'
}

export const DashboardSidebar = () => {
  return (
    <div className="flex h-full flex-col">
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

