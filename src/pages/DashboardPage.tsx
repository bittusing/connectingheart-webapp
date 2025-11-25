import { DashboardHero } from '../components/dashboard/DashboardHero'
import { SectionRail } from '../components/dashboard/SectionRail'
import { StatsGrid } from '../components/dashboard/StatsGrid'
import { useNotificationCounts } from '../hooks/useNotificationCounts'
import { NotificationCountProvider } from '../context/NotificationCountContext'

export const DashboardPage = () => {
  const { counts, loading, refetch } = useNotificationCounts()

  return (
    <NotificationCountProvider counts={counts} loading={loading} refetch={refetch}>
      <div className="space-y-8">
        <DashboardHero />
        <StatsGrid />
        <SectionRail />
      </div>
    </NotificationCountProvider>
  )
}

