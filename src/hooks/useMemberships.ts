import { useCallback, useEffect, useMemo, useState } from 'react'
import type { MembershipPlan, MembershipPlanApi, MembershipSnapshot } from '../types/dashboard'
import { membershipPlans as fallbackPlans } from '../data/dashboardContent'
import { useApiClient } from './useApiClient'

type MembershipDetailsResponse = {
  code: string
  status: string
  message: string
  membershipData: {
    memberShipExpiryDate: string | null
    heartCoins: number
    planName: string
    membership_id: string
  } | null
}

const formatCurrency = (currency: string) => {
  if (currency === 'INR') {
    return '₹'
  }
  return `${currency} `
}

const mapPlansToCards = (plans: MembershipPlanApi[]): MembershipPlan[] => {
  if (!plans.length) {
    return fallbackPlans
  }

  const highestAmount = Math.max(...plans.map((plan) => plan.membershipAmount))

  return plans.map((plan) => {
    const currencySymbol = formatCurrency(plan.currency)
    const price = `${currencySymbol}${plan.membershipAmount.toLocaleString('en-IN')} / ${plan.duration} months`
    const description = `${plan.heartCoins} Heart Coins • ${plan.duration} months validity`
    return {
      id: plan._id,
      name: plan.planName,
      price,
      description,
      perks: plan.features,
      highlight: plan.membershipAmount === highestAmount,
      cta: 'Choose plan',
    }
  })
}

const mapMembershipDetails = (data: MembershipDetailsResponse['membershipData']): MembershipSnapshot | null => {
  if (!data) {
    return null
  }

  return {
    membershipId: data.membership_id,
    planName: data.planName,
    heartCoins: data.heartCoins,
    memberShipExpiryDate: data.memberShipExpiryDate,
  }
}

export const useMemberships = () => {
  const api = useApiClient()
  const [plans, setPlans] = useState<MembershipPlan[]>(fallbackPlans)
  const [myMembership, setMyMembership] = useState<MembershipSnapshot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembershipData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [planResponse, membershipResponse] = await Promise.all([
        api.get<MembershipPlanApi[]>('dashboard/getMembershipList'),
        api.get<MembershipDetailsResponse>('dashboard/getMyMembershipDetails'),
      ])

      setPlans(mapPlansToCards(planResponse))
      setMyMembership(mapMembershipDetails(membershipResponse.membershipData))
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message.replace('API ', '') || 'Unable to fetch membership data.'
          : 'Unable to fetch membership data.'
      setError(message)
      // Keep fallback data for plans
      setPlans(fallbackPlans)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchMembershipData()
  }, [fetchMembershipData])

  const heartCoins = useMemo(() => myMembership?.heartCoins ?? 0, [myMembership])

  return {
    plans,
    myMembership,
    isLoading,
    error,
    heartCoins,
    refetch: fetchMembershipData,
  }
}


