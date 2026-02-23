import { useMemo, useEffect, useState } from 'react'
import { DashboardHero } from '../components/dashboard/DashboardHero'
import { SectionRail } from '../components/dashboard/SectionRail'
import { StatsGrid } from '../components/dashboard/StatsGrid'
import { useUserProfile } from '../hooks/useUserProfile'
import { useJustJoinedCount } from '../hooks/useJustJoinedCount'
import { useAcceptanceCount } from '../hooks/useAcceptanceCount'
import { useApiClient } from '../hooks/useApiClient'
import { statTiles } from '../data/dashboardContent'
import { DashboardBannerSlider } from '../components/dashboard/DashboardBannerSlider'
import { KYCModal } from '../components/forms/KYCModal'

type GetUserResponse = {
  code: string
  status: string
  message: string
  data: {
    _id: string
    kycStatus?: 'pending' | 'verified' | 'failed'
    countryCode?: string
    [key: string]: any
  }
}

export const DashboardPage = () => {
  const api = useApiClient()
  const { profile } = useUserProfile()
  const { count: justJoinedCount, loading: justJoinedLoading } = useJustJoinedCount()
  const { count: acceptanceCount, loading: acceptanceLoading } = useAcceptanceCount()
  
  const [kycModalOpen, setKycModalOpen] = useState(false)
  const [checkingKyc, setCheckingKyc] = useState(true)

  // Check KYC status on mount
  useEffect(() => {
    const checkKycStatus = async () => {
      try {
        const response = await api.get<GetUserResponse>('auth/getUser')
        
        if (response.status === 'success' && response.data) {
          const { kycStatus, countryCode } = response.data
          
          // Only show KYC modal for Indian users (+91) who haven't verified
          if (countryCode === '+91' && kycStatus !== 'verified') {
            setKycModalOpen(true)
          }
        }
      } catch (error) {
        console.error('Error checking KYC status:', error)
      } finally {
        setCheckingKyc(false)
      }
    }

    checkKycStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        image: '/banner11.jpg',
        title: 'Heartfulness Celebrations',
        description: 'Blessed unions guided by love, grace, and shared purpose.',
      },
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
      
      {/* KYC Verification Modal */}
      <KYCModal
        open={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        onSuccess={() => {
          setKycModalOpen(false)
          // Optionally reload page or update state
          window.location.reload()
        }}
      />
    </div>
  )
}

