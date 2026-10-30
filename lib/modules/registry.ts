import {
  LayoutDashboard,
  HardDrive,
  Calendar,
  CheckSquare,
  Bell,
  TrendingUp,
  Link2,
  Sparkles,
  Package,
  Compass,
  FileText,
  Layers,
  ShoppingBag,
  GraduationCap,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'

export type PersonaType =
  | 'content_creator'
  | 'product_creator'
  | 'freelancer'
  | 'educator'

export interface ModuleItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
  owner?: 'shiva' | 'bhavya' | 'tilak'
  isComingSoon?: boolean
}

export const MODULE_REGISTRY: Record<PersonaType, ModuleItem[]> = {
  content_creator: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      owner: 'shiva',
    },
    {
      id: 'bucket',
      label: 'Bucket',
      icon: HardDrive,
      href: '/dashboard/bucket',
      owner: 'bhavya',
      isComingSoon: true,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      href: '/dashboard/calendar',
      owner: 'shiva',
    },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: CheckSquare,
      href: '/dashboard/approvals',
      owner: 'bhavya',
      isComingSoon: true,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      href: '/dashboard/notifications',
      owner: 'shiva',
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: TrendingUp,
      href: '/dashboard/earnings',
      owner: 'shiva',
    },
    {
      id: 'connections',
      label: 'Connections',
      icon: Link2,
      href: '/dashboard/connections',
      owner: 'shiva',
    },
    {
      id: 'assistant',
      label: 'Assistant',
      icon: Sparkles,
      href: '/dashboard/assistant',
      owner: 'tilak',
      isComingSoon: true,
    },
  ],

  product_creator: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      owner: 'shiva',
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      href: '/dashboard/products',
      owner: 'shiva',
    },
    {
      id: 'beluga',
      label: 'Beluga',
      icon: Compass,
      href: '/dashboard/beluga',
      owner: 'shiva',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      href: '/dashboard/calendar',
      owner: 'shiva',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      href: '/dashboard/notifications',
      owner: 'shiva',
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: TrendingUp,
      href: '/dashboard/earnings',
      owner: 'shiva',
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: FileText,
      href: '/dashboard/invoices',
      owner: 'shiva',
    },
  ],

  freelancer: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      owner: 'shiva',
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: Layers,
      href: '/dashboard/templates',
      owner: 'shiva',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      href: '/dashboard/calendar',
      owner: 'shiva',
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: TrendingUp,
      href: '/dashboard/earnings',
      owner: 'shiva',
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: FileText,
      href: '/dashboard/invoices',
      owner: 'shiva',
    },
  ],

  educator: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      owner: 'shiva',
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: GraduationCap,
      href: '/dashboard/courses',
      owner: 'shiva',
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: BarChart3,
      href: '/dashboard/sales',
      owner: 'shiva',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      href: '/dashboard/calendar',
      owner: 'shiva',
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: TrendingUp,
      href: '/dashboard/earnings',
      owner: 'shiva',
    },
  ],
}

export function getModulesForPersona(persona: string | null | undefined): ModuleItem[] {
  const key = (persona as PersonaType) || 'content_creator'
  return MODULE_REGISTRY[key] || MODULE_REGISTRY.content_creator
}
