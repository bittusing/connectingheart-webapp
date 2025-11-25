import { DashboardHero } from '../components/dashboard/DashboardHero'
import { SectionRail } from '../components/dashboard/SectionRail'
import { StatsGrid } from '../components/dashboard/StatsGrid'

export const DashboardPage = () => (
  <div className="space-y-8">
    <DashboardHero />
    <StatsGrid />
    <SectionRail />
  </div>
)

