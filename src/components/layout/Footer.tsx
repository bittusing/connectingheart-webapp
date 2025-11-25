import { Link } from 'react-router-dom'
import { BrandLogo } from './BrandLogo'

const footerLinks = [
  {
    title: 'Company',
    items: [
      { label: 'About', href: '/#discover' },
      { label: 'Stories', href: '/#stories' },
      { label: 'Policy', path: '/policy' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Help center', href: '/#plans' },
      { label: 'Contact', href: 'mailto:hello@connectingheart.co' },
    ],
  },
]

export const Footer = () => (
  <footer className="bg-slate-900 text-slate-200">
    <div className="section-shell">
      <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
        <div className="space-y-4">
          <BrandLogo />
          <p className="max-w-md text-sm text-slate-400">
            A modern matrimonial experience built on trust, privacy, and
            meaningful technology. Inspired by connectingheart.co — made more
            immersive with Tailwind CSS.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <p className="font-semibold text-white">{section.title}</p>
              <ul className="mt-4 space-y-2 text-slate-400">
                {section.items.map((item) =>
                  item.path ? (
                    <li key={item.label}>
                      <Link
                        to={item.path}
                        className="transition hover:text-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={item.label}>
                      <a href={item.href} className="transition hover:text-white">
                        {item.label}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} ConnectingHeart. All rights reserved.
      </div>
    </div>
  </footer>
)

