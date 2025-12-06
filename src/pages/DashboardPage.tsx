import { useMemo } from 'react'
import { DashboardHero } from '../components/dashboard/DashboardHero'
import { SectionRail } from '../components/dashboard/SectionRail'
import { StatsGrid } from '../components/dashboard/StatsGrid'
import { useUserProfile } from '../hooks/useUserProfile'
import { useJustJoinedCount } from '../hooks/useJustJoinedCount'
import { useAcceptanceCount } from '../hooks/useAcceptanceCount'
import { statTiles } from '../data/dashboardContent'
import { DashboardBannerSlider } from '../components/dashboard/DashboardBannerSlider'

export const DashboardPage = () => {
  const { profile } = useUserProfile()
  const { count: justJoinedCount, loading: justJoinedLoading } = useJustJoinedCount()
  const { count: acceptanceCount, loading: acceptanceLoading } = useAcceptanceCount()

  const completionPercentage =
    profile && 'isVerified' in profile && profile.isVerified ? 100 : 80

  const heroProfile = profile
    ? {
        name: profile.name ?? `HEARTS-${profile.heartsId ?? ''}`,
        avatar: profile.avatarUrl ?? undefined,
        membershipTier: profile.planName ?? 'Essential',
        completionPercentage,
        lookingFor: profile.description ? 'Life Partner' : undefined,
        gender: profile.gender,
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
      if (tile.label === 'Acceptance') {
        return {
          ...tile,
          value: acceptanceLoading ? '...' : acceptanceCount,
          href: '/acceptance',
        }
      }
      return tile
    })
  }, [justJoinedCount, justJoinedLoading, acceptanceCount, acceptanceLoading])

  const celebrationSlides = useMemo(
    () => [
      {
        image: '/banner1.jpg',
        title: 'Heartfulness Weddings',
        description: 'Blessed unions guided by love, grace, and shared purpose.',
      },
      {
        image: '/banner2.jpg',
        title: 'Celebrating Togetherness',
        description: 'Families and seekers coming together for meaningful connections.',
      },
      {
        image: '/banner3.jpg',
        title: 'Sacred Moments',
        description: 'Memories from our community ceremonies around the world.',
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <DashboardHero profile={heroProfile} />
      <DashboardBannerSlider slides={celebrationSlides} />
      <StatsGrid tiles={tilesWithCounts} />
      <SectionRail />
    </div>
  )
}

