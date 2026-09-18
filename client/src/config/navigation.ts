import {
  IconDashboard,
  IconUsers,
  IconBriefcase,
  IconBuilding,
  IconUsersGroup,
  IconCalendarEvent,
  IconChartBar,
  IconSettings,
  IconShieldLock,
  IconLayoutKanban,
} from '@tabler/icons-react';
import type { Role } from '../types';

export interface NavItem {
  icon: React.ComponentType<{ size?: number | string; stroke?: number | string }>;
  label: string;
  path: string;
  /** Omitted = visible to every authenticated role. */
  roles?: Role[];
}

/**
 * Single source of truth for the app's navigation, shared by Sidebar
 * (desktop) and AppLayout (mobile nav + ⌘K quick switcher), which each used
 * to keep their own copy of this list — the two had already drifted once
 * (TECH-04 in the audit). Role-filtered here so a hiring manager never sees
 * a nav item that a route guard would then turn away.
 */
export const mainNavItems: NavItem[] = [
  { icon: IconDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: IconUsers, label: 'Candidates', path: '/candidates' },
  { icon: IconLayoutKanban, label: 'Pipeline', path: '/pipeline' },
  { icon: IconBriefcase, label: 'Jobs', path: '/jobs', roles: ['recruiter', 'admin'] },
  { icon: IconBuilding, label: 'Companies', path: '/companies', roles: ['recruiter', 'admin'] },
  { icon: IconUsersGroup, label: 'Team', path: '/team', roles: ['recruiter', 'admin'] },
  { icon: IconCalendarEvent, label: 'Calendar', path: '/calendar' },
  { icon: IconChartBar, label: 'Reports', path: '/reports', roles: ['recruiter', 'admin'] },
];

export const bottomNavItems: NavItem[] = [
  { icon: IconShieldLock, label: 'Admin', path: '/admin/users', roles: ['admin'] },
  { icon: IconSettings, label: 'Settings', path: '/settings' },
];

export function visibleNavItems(items: NavItem[], role: Role): NavItem[] {
  return items.filter((item) => !item.roles || item.roles.includes(role));
}
