// Icon types for navigation
export type IconName =
  | 'home'
  | 'user'
  | 'search'
  | 'users'
  | 'sparkles'
  | 'eye'
  | 'badge'
  | 'lock-closed'
  | 'trash'
  | 'chat'
  | 'lifebuoy'
  | 'document'
  | 'shield'
  | 'heart'
  | 'logout'

// Navigation item structure
export type NavItem = {
  label: string
  icon: IconName
  href: string
  badge?: string
  external?: boolean
  onClick?: () => void
}

// Statistics tile for dashboard metrics
export type StatTile = {
  label: string
  value: number | string
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  href?: string
  onClick?: () => void
}

// Profile card data structure
export type ProfileCardData = {
  id: string
  heartsId?: number
  name: string
  age: number
  height: string
  income: string
  caste?: string
  location: string
  avatar?: string | null
  verified?: boolean
  gender?: string
}

// Dashboard section with profile cards
export type DashboardSection = {
  id: string
  title: string
  total: number
  actionLabel: string
  cards: ProfileCardData[]
  viewAllHref?: string
}

// User profile summary for hero section
export type UserProfileSummary = {
  name: string
  avatar?: string | null
  completionPercentage: number
  membershipTier?: string
  lookingFor?: string
  lookingForAvatar?: string | null
  gender?: string
}

// Dashboard stats summary
export type DashboardStats = {
  acceptance: number
  justJoined: number
  shortlisted?: number
  premiumLeads?: number
}

export type ProfileCollection = {
  key: 'all' | 'recommendations' | 'visitors'
  title: string
  subtitle: string
  totalResults: number
  currentPage: number
  totalPages: number
  profiles: ProfileCardData[]
  meta?: {
    note?: string
  }
}

export type MembershipPlan = {
  id: string
  name: string
  price: string
  description: string
  perks: string[]
  highlight?: boolean
  cta?: string
}

export type MembershipPlanApi = {
  _id: string
  membershipAmount: number
  currency: string
  planName: string
  duration: number
  heartCoins: string
  features: string[]
}

export type MembershipSnapshot = {
  membershipId: string
  planName: string
  heartCoins: number
  memberShipExpiryDate: string | null
}


