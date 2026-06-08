import {
  LayoutDashboard,
  FilePlus2,
  ListChecks,
  Bell,
  BarChart3,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/lib/constants';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['parent', 'teacher', 'admin', 'staff'] },
  { label: 'Report Issue', href: '/report-issue', icon: FilePlus2, roles: ['parent', 'teacher', 'admin'] },
  { label: 'Track Issues', href: '/tracking', icon: ListChecks, roles: ['parent', 'teacher', 'admin', 'staff'] },
  { label: 'Notifications', href: '/notifications', icon: Bell, roles: ['parent', 'teacher', 'admin', 'staff'] },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['admin'] },
  { label: 'Admin Panel', href: '/admin', icon: ShieldCheck, roles: ['admin'] },
];

export function navForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((i) => i.roles.includes(role));
}
