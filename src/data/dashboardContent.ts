import type {
  DashboardSection,
  MembershipPlan,
  NavItem,
  StatTile,
} from '../types/dashboard'

export const navItems: NavItem[] = [
  { label: 'Home', icon: 'home', href: '/dashboard' },
  { label: 'Edit Profile', icon: 'user', href: '/dashboard/profile' },
  { label: 'Search', icon: 'search', href: '/dashboard/search' },
  { label: 'All Profiles', icon: 'users', href: '/dashboard/profiles' },
  { label: 'Daily Recommendations', icon: 'sparkles', href: '/dashboard/recommendations' },
  { label: 'Profile Visitors', icon: 'eye', href: '/dashboard/visitors' },
  { label: 'Membership', icon: 'badge', href: '/dashboard/membership', badge: 'Upgrade' },
  { label: 'Change Password', icon: 'lock-closed', href: '/dashboard/security' },
  { label: 'Delete Profile', icon: 'trash', href: '/dashboard/delete' },
  { label: 'Feedback', icon: 'chat', href: '/dashboard/feedback' },
  { label: 'Help Center', icon: 'lifebuoy', href: '/dashboard/help' },
  { label: 'Terms & Conditions', icon: 'document', href: '/dashboard/terms' },
  { label: 'Privacy Policy', icon: 'shield', href: '/dashboard/privacy' },
  { label: 'Donate Now', icon: 'heart', href: 'https://contributions.heartfulness.org/in-en/donation-general-fund', external: true },
  { label: 'Logout', icon: 'logout', href: '/login' },
]

export const statTiles: StatTile[] = [
  { label: 'Acceptance', value: 0, description: 'Matches accepted this week' },
  { label: 'Just joined', value: 1, description: 'New prospects today' },
  { label: 'Shortlisted', value: 6, description: 'Saved for later' },
  { label: 'Premium leads', value: 12, description: 'Highlighted to you' },
]

export const sections: DashboardSection[] = [
  {
    id: 'interest-received',
    title: 'Interest Received',
    total: 0,
    actionLabel: 'View Interest',
    cards: [],
    viewAllHref: '/dashboard/interests',
  },
  {
    id: 'daily-recommendations',
    title: 'Daily Recommendation',
    total: 0,
    actionLabel: 'View Profile',
    cards: [],
    viewAllHref: '/dashboard/recommendations',
  },
  {
    id: 'profile-visitors',
    title: 'Profile Visitors',
    total: 0,
    actionLabel: 'View Visitor',
    cards: [],
    viewAllHref: '/dashboard/visitors',
  },
  {
    id: 'all-profiles',
    title: 'All Profiles',
    total: 0,
    actionLabel: 'View Profile',
    cards: [],
    viewAllHref: '/dashboard/profiles',
  },
]

export const membershipPlans: MembershipPlan[] = [
  {
    id: 'silver',
    name: 'Silver',
    price: '₹3,000 / 6 months',
    description: 'Perfect to explore premium visibility and verified matches.',
    perks: [
      'View 50 verified contacts',
      'Priority matchmaking queue',
      'Profile boost once every month',
      'Dedicated success manager via chat',
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    price: '₹4,500 / 9 months',
    description: 'Our most popular plan with concierge assistance.',
    perks: [
      'View 100 verified contacts',
      'Weekly concierge call',
      'Top position in search filters',
      'Complimentary profile review',
    ],
    highlight: true,
    cta: 'Upgrade now',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: '₹5,500 / 12 months',
    description: 'White-glove matchmaking for families seeking priority service.',
    perks: [
      'Unlimited verified contacts',
      'Senior matchmaker & family liaison',
      'Invitations to exclusive offline meetups',
      'Profile filming & storytelling kit',
    ],
  },
]

