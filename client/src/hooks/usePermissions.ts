import { useMemo } from 'react';
import { useUser } from '../context/UserContext';
import type { Role } from '../types';

/**
 * The permission boundary table from
 * /docs/clever-recruit-information-architecture.md, encoded once so every
 * route guard and every conditionally-rendered control reads from the same
 * source instead of re-deriving "can this role do X" inline. AUD-P0-01.
 */
export type Permission =
  | 'jobs.manage' // create / edit / publish / close a job
  | 'candidates.manage' // create / edit / delete a candidate, free stage changes
  | 'candidates.review' // view + shortlist / reject / leave feedback
  | 'interviews.manage' // schedule, cancel, record an outcome — AUD-P1-02
  | 'companies.view'
  | 'team.view'
  | 'reports.view'
  | 'admin.users';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  recruiter: [
    'jobs.manage',
    'candidates.manage',
    'candidates.review',
    'interviews.manage',
    'companies.view',
    'team.view',
    'reports.view',
  ],
  hiring_manager: ['candidates.review'],
  admin: [
    'jobs.manage',
    'candidates.manage',
    'candidates.review',
    'interviews.manage',
    'companies.view',
    'team.view',
    'reports.view',
    'admin.users',
  ],
};

/** Human labels for the Permission union, shared by the Roles reference page
    so it reads from the same source of truth as the guards instead of
    keeping its own copy (the drift TECH-04 already called out once, for
    nav items — see config/navigation.ts). */
export const PERMISSION_LABEL: Record<Permission, string> = {
  'jobs.manage': 'Create, edit, publish and close jobs',
  "candidates.manage": "Create, edit and change a candidate's stage",
  'candidates.review': 'Review candidates — shortlist, reject, leave feedback',
  'interviews.manage': 'Schedule, cancel and record interview outcomes',
  'companies.view': 'View companies',
  'team.view': 'View team',
  'reports.view': 'View reports',
  'admin.users': 'Invite users and change roles',
};

/** Routes gated to specific roles, keyed by path, for use in RequireRole guards. */
export const ROUTE_ROLES: Record<string, Role[]> = {
  '/jobs': ['recruiter', 'admin'],
  '/companies': ['recruiter', 'admin'],
  '/team': ['recruiter', 'admin'],
  '/reports': ['recruiter', 'admin'],
  '/admin/users': ['admin'],
  '/admin/roles': ['admin'],
  '/admin/organisation': ['admin'],
};

export function usePermissions() {
  const { role } = useUser();

  return useMemo(() => {
    const granted = new Set(ROLE_PERMISSIONS[role] ?? []);
    return {
      role,
      can: (permission: Permission) => granted.has(permission),
    };
  }, [role]);
}
