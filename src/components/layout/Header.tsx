import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Button } from '../common/Button'
import { BrandLogo } from './BrandLogo'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
  { label: 'Discover', href: '/#discover' },
  { label: 'Services', href: '/#services' },
  { label: 'Stories', href: '/#stories' },
  { label: 'Plans', href: '/#plans' },
  { label: 'Policy', path: '/policy' },
]

export const Header = () => {
  const [open, setOpen] = useState(false)

  const closeMenu = () => setOpen(false)

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl">
      <div className="section-shell py-6">
        <div className="glass-panel flex items-center justify-between gap-4">
          <BrandLogo />
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-200 lg:flex">
            {navItems.map((item) =>
              item.path ? (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'transition hover:text-brand-500'
                  }
                >
                  {item.label}
                </NavLink>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="transition hover:text-brand-500"
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/register">
              <Button>Join free</Button>
            </Link>
          </div>
          <button
            type="button"
            className="inline-flex items-center rounded-full border border-slate-200 p-2 text-slate-700 transition hover:text-brand-500 dark:border-slate-700 dark:text-white lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="section-shell pt-0 lg:hidden">
          <div className="glass-panel space-y-4 text-center">
            <nav className="flex flex-col gap-3 text-base font-medium text-slate-600 dark:text-slate-200">
              {navItems.map((item) =>
                item.path ? (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      isActive
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'transition hover:text-brand-500'
                    }
                  >
                    {item.label}
                  </NavLink>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={closeMenu}
                    className="transition hover:text-brand-500"
                  >
                    {item.label}
                  </a>
                ),
              )}
            </nav>
            <div className="flex flex-col gap-3">
              <ThemeToggle />
              <Link to="/login" onClick={closeMenu}>
                <Button variant='ghost' fullWidth>
                  Log in
                </Button>
              </Link>
              <Link to="/register" onClick={closeMenu}>
                <Button fullWidth>Join free</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

