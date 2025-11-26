import { DashboardHero } from '../components/dashboard/DashboardHero'
import { SectionRail } from '../components/dashboard/SectionRail'
import { StatsGrid } from '../components/dashboard/StatsGrid'
import { useUserProfile } from '../hooks/useUserProfile'
import { useJustJoinedCount } from '../hooks/useJustJoinedCount'
import { statTiles } from '../data/dashboardContent'
import { useMemo } from 'react'

export const DashboardPage = () => {
  const { profile } = useUserProfile()
  const { count: justJoinedCount, loading: justJoinedLoading } = useJustJoinedCount()

  const completionPercentage =
    profile && 'isVerified' in profile && profile.isVerified ? 100 : 80

  const heroProfile = profile
    ? {
        name: profile.name ?? `HEARTS-${profile.heartsId ?? ''}`,
        avatar: profile.avatarUrl ?? undefined,
        membershipTier: profile.planName ?? 'Essential',
        completionPercentage,
        lookingFor: profile.description ? 'Life Partner' : undefined,
      }
    : undefined

  const tilesWithCounts = useMemo(() => {
    return statTiles.map((tile) => {
      if (tile.label === 'Just joined') {
        return {
          ...tile,
          value: justJoinedLoading ? '...' : justJoinedCount,
          href: '/dashboard/justjoined',
        }
      }
      return tile
    })
  }, [justJoinedCount, justJoinedLoading])

  return (
  <div className="space-y-6">
      <DashboardHero profile={heroProfile} />
      <StatsGrid tiles={tilesWithCounts} />
    <SectionRail />
  </div>
)
}

