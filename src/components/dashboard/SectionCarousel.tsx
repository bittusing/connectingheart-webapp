import { sections } from '../../data/dashboardContent'
import { ProfileCard } from './ProfileCard'

export const SectionCarousel = () => (
  <div className="space-y-10">
    {sections.map((section) => (
      <div key={section.title} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">
              {section.total} profiles
            </p>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {section.title}
            </h3>
          </div>
          <button className="text-sm font-semibold text-pink-500">View all</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {section.cards.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} actionLabel={section.actionLabel} />
          ))}
        </div>
      </div>
    ))}
  </div>
)

