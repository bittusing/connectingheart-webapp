import {
  ArrowRightOnRectangleIcon,
  BookmarkSquareIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
  EyeIcon,
  HeartIcon,
  HomeIcon,
  LifebuoyIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrashIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import type { IconName } from '../../types/dashboard'

const iconMap: Record<IconName, React.ComponentType<{ className?: string }>> = {
  home: HomeIcon,
  user: UserIcon,
  search: MagnifyingGlassIcon,
  users: UserGroupIcon,
  sparkles: SparklesIcon,
  eye: EyeIcon,
  badge: BookmarkSquareIcon,
  'lock-closed': LockClosedIcon, 
  trash: TrashIcon,
  chat: ChatBubbleBottomCenterTextIcon,
  lifebuoy: LifebuoyIcon,
  document: DocumentTextIcon,
  shield: ShieldCheckIcon,
  heart: HeartIcon,
  logout: ArrowRightOnRectangleIcon,
}

export const DashboardIcon = ({
  name,
  className,
}: {
  name: IconName
  className?: string
}) => {
  const IconComponent = iconMap[name] ?? HomeIcon
  return <IconComponent className={className} />
}

