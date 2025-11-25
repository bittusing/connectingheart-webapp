import { DashboardHero } from '../components/dashboard/DashboardHero'
import { SectionRail } from '../components/dashboard/SectionRail'
import { StatsGrid } from '../components/dashboard/StatsGrid'
import { useUserProfile } from '../hooks/useUserProfile'

export const DashboardPage = () => {
  const { profile } = useUserProfile()

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

  return (
    <div className="space-y-8">
      <DashboardHero profile={heroProfile} />
      <StatsGrid />
      <SectionRail />
    </div>
  )
}

